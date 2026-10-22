import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import sharp from 'sharp';
import { createError } from '../middleware/errorHandler';
import type { GenerateRequest } from '../validators/generate.validator';
import type { GenerationResult } from '../types';

const STABILITY_RELIGHT_ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/edit/replace-background-and-relight';
const STABILITY_RESULTS_ENDPOINT = 'https://api.stability.ai/v2beta/results';

export interface RelightResult {
  imageBase64: string;
  mimeType: string;
  seed?: number;
  model: string;
  prompt: string;
  workflowUsed: 'replace-background-and-relight';
  pollCount: number;
  durationMs: number;
}

/**
 * Executes Stability AI's Replace Background and Relight API with asynchronous polling.
 * Sends uploaded product image as subject_image and user's scene prompt as background_prompt.
 */
export async function replaceBackgroundAndRelight(
  filePath: string,
  params: GenerateRequest
): Promise<RelightResult> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw createError(
      'Stability AI API key is not configured. Set STABILITY_API_KEY in server/.env',
      503,
      'API_KEY_MISSING'
    );
  }

  const startTime = Date.now();

  // Preprocess input image to ensure compliance with Stability constraints
  // (Sides at least 64px, total pixels between 4,096 and 4,194,304)
  let imageBuffer = fs.readFileSync(filePath);
  const meta = await sharp(imageBuffer).metadata();
  if (meta.width && meta.height) {
    const totalPixels = meta.width * meta.height;
    if (totalPixels > 4_194_304 || meta.width > 2048 || meta.height > 2048) {
      const resized = await sharp(imageBuffer)
        .resize(1536, 1536, { fit: 'inside' })
        .png()
        .toBuffer();
      imageBuffer = Buffer.from(resized);
    }
  }

  const form = new FormData();
  form.append('subject_image', imageBuffer, {
    filename: 'subject.png',
    contentType: 'image/png',
  });
  form.append('background_prompt', params.prompt);
  form.append('preserve_original_subject', '1.0');
  form.append('output_format', params.outputFormat || 'png');

  if (params.negativePrompt) {
    form.append('negative_prompt', params.negativePrompt);
  }
  if (params.seed !== undefined) {
    form.append('seed', String(params.seed));
  }

  // Safe diagnostic log (never logging secret key)
  console.log(`[MOCKUP-STUDIO] POST ${STABILITY_RELIGHT_ENDPOINT}`);
  console.log(`[MOCKUP-STUDIO] Parameters: format=${params.outputFormat}, preserve_subject=1.0`);

  let generationId: string;
  try {
    const response = await axios.post(STABILITY_RELIGHT_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      timeout: 60_000,
      maxContentLength: 50 * 1024 * 1024,
    });

    console.log(`[MOCKUP-STUDIO] Relight submitted. Status: ${response.status}`);

    const data = response.data as { id?: string; result?: string; image?: string; seed?: number };

    // In case the API returns the result synchronously:
    if (data.result || data.image) {
      const base64 = data.result || data.image!;
      const mimeType = params.outputFormat === 'jpeg' ? 'image/jpeg' : params.outputFormat === 'webp' ? 'image/webp' : 'image/png';
      return {
        imageBase64: base64,
        mimeType,
        seed: data.seed,
        model: 'replace-background-and-relight',
        prompt: params.prompt,
        workflowUsed: 'replace-background-and-relight',
        pollCount: 0,
        durationMs: Date.now() - startTime,
      };
    }

    if (!data.id) {
      throw createError('Provider did not return a generation ID.', 502, 'PROVIDER_NO_ID');
    }

    generationId = data.id;
  } catch (err) {
    handleAxiosError(err, 'Relight submission');
  }

  // Asynchronous Polling loop
  console.log(`[MOCKUP-STUDIO] Polling generation task ID: ${generationId}`);
  let pollAttempts = 0;
  const maxAttempts = 35; // ~70 seconds max
  const pollIntervalMs = 2000;

  while (pollAttempts < maxAttempts) {
    pollAttempts++;
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    try {
      const pollRes = await axios.get(`${STABILITY_RESULTS_ENDPOINT}/${generationId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        timeout: 30_000,
        validateStatus: (status) => status === 200 || status === 202,
      });

      console.log(`[MOCKUP-STUDIO] Poll attempt #${pollAttempts} -> HTTP ${pollRes.status}`);

      if (pollRes.status === 202) {
        // Still processing
        continue;
      }

      if (pollRes.status === 200) {
        const body = pollRes.data as { result?: string; finish_reason?: string; seed?: number };
        if (!body.result) {
          throw createError('Provider completed task but returned no image payload.', 502, 'PROVIDER_EMPTY_RESULT');
        }

        const mimeType = params.outputFormat === 'jpeg' ? 'image/jpeg' : params.outputFormat === 'webp' ? 'image/webp' : 'image/png';

        console.log(`[MOCKUP-STUDIO] Relight generation completed in ${Date.now() - startTime}ms (polls: ${pollAttempts})`);

        return {
          imageBase64: body.result,
          mimeType,
          seed: body.seed,
          model: 'replace-background-and-relight',
          prompt: params.prompt,
          workflowUsed: 'replace-background-and-relight',
          pollCount: pollAttempts,
          durationMs: Date.now() - startTime,
        };
      }
    } catch (pollErr) {
      handleAxiosError(pollErr, `Poll attempt #${pollAttempts}`);
    }
  }

  throw createError('Relight generation timed out during asynchronous polling.', 504, 'TIMEOUT');
}

function handleAxiosError(err: unknown, stage: string): never {
  const axiosErr = err as AxiosError;
  if (axiosErr.response) {
    const status = axiosErr.response.status;
    const body = axiosErr.response.data as Record<string, unknown>;
    const message =
      typeof body?.message === 'string'
        ? body.message
        : typeof body?.errors === 'object'
        ? JSON.stringify(body.errors)
        : 'Unknown provider error';

    console.error(`[MOCKUP-STUDIO] ${stage} failed with HTTP ${status}: ${message}`);

    if (status === 401) {
      throw createError('Invalid Stability AI API key.', 401, 'INVALID_API_KEY');
    }
    if (status === 402 || message.toLowerCase().includes('credit')) {
      throw createError('Insufficient Stability AI credits.', 402, 'INSUFFICIENT_CREDITS');
    }
    if (status === 404) {
      throw createError(`Generation task not found or expired on provider.`, 404, 'TASK_NOT_FOUND');
    }
    if (status === 429) {
      throw createError('Stability AI rate limit reached. Please wait a moment.', 429, 'PROVIDER_RATE_LIMIT');
    }

    throw createError(`Stability Relight error (HTTP ${status}): ${message}`, status >= 500 ? 502 : 400, 'PROVIDER_ERROR');
  }

  if (axiosErr.code === 'ECONNABORTED') {
    throw createError(`${stage} timed out.`, 504, 'TIMEOUT');
  }

  console.error(`[MOCKUP-STUDIO] Network error during ${stage}:`, axiosErr.message);
  throw createError('Network error connecting to Stability AI.', 503, 'NETWORK_ERROR');
}
