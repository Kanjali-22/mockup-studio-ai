import fs from 'fs';
import { GenerateRequest } from '../validators/generate.validator';
import { createError } from '../middleware/errorHandler';
import { replaceBackgroundAndRelight } from './relight.service';
import { removeBackground } from './backgroundRemoval.service';
import { generateBackgroundScene } from './backgroundGeneration.service';
import { compositeProductOntoBackground } from './compositing.service';

export interface GenerationResult {
  imageBase64: string;
  mimeType: string;
  seed?: number;
  model: string;
  prompt: string;
  workflowUsed: 'replace-background-and-relight' | 'remove-background-and-composite';
  productPreserved: boolean;
  debugInfo?: {
    workflow: string;
    endpointCalled: string;
    durationMs: number;
    pollCount?: number;
  };
}

/**
 * Main entry point for AI Product Mockup generation.
 * Supports:
 * 1. Stability AI's Replace Background and Relight API (subject_image + background_prompt)
 * 2. Background Removal + Generated Scene + Sharp Compositing (100% pixel-preserving guarantee)
 */
export async function generateImage(
  filePath: string,
  params: GenerateRequest
): Promise<GenerationResult> {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw createError(
      'Stability AI API key is not configured. Set STABILITY_API_KEY in server/.env',
      503,
      'API_KEY_MISSING'
    );
  }

  const startTime = Date.now();
  const selectedWorkflow = params.workflow || 'auto';

  // 1. Dedicated Relight Workflow
  if (selectedWorkflow === 'relight') {
    console.log(`[MOCKUP-STUDIO] Executing 'replace-background-and-relight' workflow...`);
    const relightRes = await replaceBackgroundAndRelight(filePath, params);
    return {
      imageBase64: relightRes.imageBase64,
      mimeType: relightRes.mimeType,
      seed: relightRes.seed,
      model: relightRes.model,
      prompt: relightRes.prompt,
      workflowUsed: 'replace-background-and-relight',
      productPreserved: true,
      debugInfo: {
        workflow: 'replace-background-and-relight',
        endpointCalled: 'https://api.stability.ai/v2beta/stable-image/edit/replace-background-and-relight',
        durationMs: relightRes.durationMs,
        pollCount: relightRes.pollCount,
      },
    };
  }

  // 2. Dedicated Compositing Workflow (100% pixel preservation guarantee)
  if (selectedWorkflow === 'composite') {
    return executeCompositingWorkflow(filePath, params, startTime);
  }

  // 3. Auto Workflow: Try Relight first, fallback to Compositing on error
  console.log(`[MOCKUP-STUDIO] Executing 'auto' workflow: attempting relight first...`);
  try {
    const relightRes = await replaceBackgroundAndRelight(filePath, params);
    return {
      imageBase64: relightRes.imageBase64,
      mimeType: relightRes.mimeType,
      seed: relightRes.seed,
      model: relightRes.model,
      prompt: relightRes.prompt,
      workflowUsed: 'replace-background-and-relight',
      productPreserved: true,
      debugInfo: {
        workflow: 'replace-background-and-relight',
        endpointCalled: 'https://api.stability.ai/v2beta/stable-image/edit/replace-background-and-relight',
        durationMs: relightRes.durationMs,
        pollCount: relightRes.pollCount,
      },
    };
  } catch (err) {
    console.warn(`[MOCKUP-STUDIO] Relight workflow failed or unavailable, falling back to Compositing workflow:`, (err as Error).message);
    return executeCompositingWorkflow(filePath, params, startTime);
  }
}

async function executeCompositingWorkflow(
  filePath: string,
  params: GenerateRequest,
  startTime: number
): Promise<GenerationResult> {
  console.log(`[MOCKUP-STUDIO] Step 1: Processing product image (background removal: ${params.removeBackground})...`);
  const originalBuffer = fs.readFileSync(filePath);

  let transparentProductBuffer: Buffer;
  if (params.removeBackground) {
    transparentProductBuffer = await removeBackground(originalBuffer);
  } else {
    transparentProductBuffer = originalBuffer;
  }

  console.log(`[MOCKUP-STUDIO] Step 2: Generating background scene with prompt: "${params.prompt}"...`);
  const bgResult = await generateBackgroundScene({
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    aspectRatio: params.aspectRatio,
    model: params.model,
    seed: params.seed,
    outputFormat: params.outputFormat,
  });

  console.log(`[MOCKUP-STUDIO] Step 3: Compositing product onto generated background with Sharp...`);
  const compositeRes = await compositeProductOntoBackground(
    bgResult.buffer,
    transparentProductBuffer,
    {
      aspectRatio: params.aspectRatio,
      productScale: params.productScale,
      positionX: params.positionX,
      positionY: params.positionY,
      contactShadow: params.contactShadow,
      colorMatch: params.colorMatch,
      outputFormat: params.outputFormat,
    }
  );

  const durationMs = Date.now() - startTime;
  console.log(`[MOCKUP-STUDIO] Compositing workflow complete in ${durationMs}ms`);

  return {
    imageBase64: compositeRes.imageBuffer.toString('base64'),
    mimeType: compositeRes.mimeType,
    seed: bgResult.seed,
    model: `composite-with-${params.model}`,
    prompt: params.prompt,
    workflowUsed: 'remove-background-and-composite',
    productPreserved: true,
    debugInfo: {
      workflow: 'remove-background-and-composite',
      endpointCalled: 'https://api.stability.ai/v2beta/stable-image/generate/core + remove-background',
      durationMs,
    },
  };
}

export function cleanupFile(filePath: string): void {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    console.warn(`Failed to clean up temp file: ${filePath}`);
  }
}

export function getSupportedModels() {
  return [
    {
      id: 'stable-image-core',
      name: 'Stable Image Core',
      description: 'Fast, cost-effective product scene generation.',
      creditCost: 'See platform.stability.ai for current pricing',
      supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'],
      supportsNegativePrompt: true,
      supportsStrength: true,
      supportsOutputFormat: true,
      supportsSeed: true,
    },
    {
      id: 'stable-image-ultra',
      name: 'Stable Image Ultra',
      description: 'State-of-the-art photorealism. Best quality results.',
      creditCost: 'See platform.stability.ai for current pricing',
      supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'],
      supportsNegativePrompt: true,
      supportsStrength: true,
      supportsOutputFormat: true,
      supportsSeed: true,
    },
  ];
}
