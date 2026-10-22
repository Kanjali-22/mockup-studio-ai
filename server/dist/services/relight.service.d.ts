import type { GenerateRequest } from '../validators/generate.validator';
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
export declare function replaceBackgroundAndRelight(filePath: string, params: GenerateRequest): Promise<RelightResult>;
//# sourceMappingURL=relight.service.d.ts.map