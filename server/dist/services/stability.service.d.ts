import { GenerateRequest } from '../validators/generate.validator';
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
export declare function generateImage(filePath: string, params: GenerateRequest): Promise<GenerationResult>;
export declare function cleanupFile(filePath: string): void;
export declare function getSupportedModels(): {
    id: string;
    name: string;
    description: string;
    creditCost: string;
    supportedAspectRatios: string[];
    supportsNegativePrompt: boolean;
    supportsStrength: boolean;
    supportsOutputFormat: boolean;
    supportsSeed: boolean;
}[];
//# sourceMappingURL=stability.service.d.ts.map