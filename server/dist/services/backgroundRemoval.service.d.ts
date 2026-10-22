/**
 * Checks whether an image buffer already has meaningful alpha transparency.
 */
export declare function imageHasTransparency(buffer: Buffer): Promise<boolean>;
/**
 * Removes the background from a product image to produce a transparent PNG.
 * Uses Stability AI's Stable Image Remove Background API.
 * If the image already has transparency, it returns the buffer directly.
 * If background removal is required but no API key is configured, throws an actionable error.
 */
export declare function removeBackground(imageBuffer: Buffer, force?: boolean): Promise<Buffer>;
//# sourceMappingURL=backgroundRemoval.service.d.ts.map