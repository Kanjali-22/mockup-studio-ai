import type { AspectRatio, OutputFormat } from '../types';
export declare const CANVAS_DIMENSIONS: Record<AspectRatio, {
    width: number;
    height: number;
}>;
export interface CompositeOptions {
    aspectRatio: AspectRatio;
    productScale?: number;
    positionX?: number;
    positionY?: number;
    contactShadow?: boolean;
    colorMatch?: boolean;
    outputFormat?: OutputFormat;
}
export interface CompositeResult {
    imageBuffer: Buffer;
    mimeType: string;
    width: number;
    height: number;
}
/**
 * Composites the genuine, untouched product image onto a generated background canvas.
 * Preserves 100% of the original product pixels, labels, logo, and geometry.
 */
export declare function compositeProductOntoBackground(backgroundBuffer: Buffer, productBuffer: Buffer, options: CompositeOptions): Promise<CompositeResult>;
//# sourceMappingURL=compositing.service.d.ts.map