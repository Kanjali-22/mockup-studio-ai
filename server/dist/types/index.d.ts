export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type OutputFormat = 'png' | 'jpeg' | 'webp';
export type ModelId = 'stable-image-core' | 'stable-image-ultra';
export interface GenerationResult {
    imageBase64: string;
    mimeType: string;
    seed?: number;
    model: string;
    prompt: string;
    aspectRatio?: AspectRatio;
    outputFormat?: OutputFormat;
    originalImageBase64?: string;
    productPreserved: boolean;
}
//# sourceMappingURL=index.d.ts.map