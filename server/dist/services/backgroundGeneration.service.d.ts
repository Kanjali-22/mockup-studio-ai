import type { AspectRatio, ModelId, OutputFormat } from '../types';
export interface BackgroundGenerationParams {
    prompt: string;
    negativePrompt?: string;
    aspectRatio: AspectRatio;
    model: ModelId;
    seed?: number;
    outputFormat?: OutputFormat;
}
export declare function generateBackgroundScene(params: BackgroundGenerationParams): Promise<{
    buffer: Buffer;
    seed?: number;
}>;
//# sourceMappingURL=backgroundGeneration.service.d.ts.map