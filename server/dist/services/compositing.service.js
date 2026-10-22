"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANVAS_DIMENSIONS = void 0;
exports.compositeProductOntoBackground = compositeProductOntoBackground;
const sharp_1 = __importDefault(require("sharp"));
exports.CANVAS_DIMENSIONS = {
    '1:1': { width: 1024, height: 1024 },
    '3:4': { width: 896, height: 1152 },
    '4:3': { width: 1152, height: 896 },
    '9:16': { width: 768, height: 1344 },
    '16:9': { width: 1344, height: 768 },
    '21:9': { width: 1536, height: 640 },
};
/**
 * Composites the genuine, untouched product image onto a generated background canvas.
 * Preserves 100% of the original product pixels, labels, logo, and geometry.
 */
async function compositeProductOntoBackground(backgroundBuffer, productBuffer, options) {
    const { aspectRatio, productScale = 0.65, positionX = 0, positionY = 0, contactShadow = true, colorMatch = false, outputFormat = 'png', } = options;
    const targetDim = exports.CANVAS_DIMENSIONS[aspectRatio] || exports.CANVAS_DIMENSIONS['1:1'];
    const canvasW = targetDim.width;
    const canvasH = targetDim.height;
    // 1. Prepare Background: Resize to exact canvas dimensions
    const background = await (0, sharp_1.default)(backgroundBuffer)
        .resize(canvasW, canvasH, { fit: 'cover', position: 'center' })
        .toBuffer();
    // 2. Prepare Product: Trim any outer transparent padding to find the real bounding box
    let trimmedProductBuffer;
    try {
        trimmedProductBuffer = await (0, sharp_1.default)(productBuffer).trim().toBuffer();
    }
    catch {
        // If image has no alpha or cannot be trimmed, use productBuffer directly
        trimmedProductBuffer = productBuffer;
    }
    const productMeta = await (0, sharp_1.default)(trimmedProductBuffer).metadata();
    const origW = productMeta.width || 500;
    const origH = productMeta.height || 500;
    // 3. Compute Product Scale preserving exact aspect ratio
    const clampedScale = Math.max(0.1, Math.min(0.95, productScale));
    let targetH = Math.round(canvasH * clampedScale);
    let targetW = Math.round((origW / origH) * targetH);
    if (targetW > canvasW * 0.92) {
        targetW = Math.round(canvasW * clampedScale);
        targetH = Math.round((origH / origW) * targetW);
    }
    const resizedProductBuffer = await (0, sharp_1.default)(trimmedProductBuffer)
        .resize(targetW, targetH, {
        fit: 'inside',
        kernel: sharp_1.default.kernel.lanczos3,
    })
        .toBuffer();
    const finalMeta = await (0, sharp_1.default)(resizedProductBuffer).metadata();
    const actualW = finalMeta.width || targetW;
    const actualH = finalMeta.height || targetH;
    // 4. Calculate Placement (centered + percentage offsets)
    const centerX = Math.round((canvasW - actualW) / 2);
    const centerY = Math.round((canvasH - actualH) / 2);
    const maxOffsetX = (canvasW - actualW) / 2;
    const maxOffsetY = (canvasH - actualH) / 2;
    const offsetX = Math.round((positionX / 50) * maxOffsetX);
    const offsetY = Math.round((positionY / 50) * maxOffsetY);
    // Guarantee product stays strictly within canvas bounds
    const finalLeft = Math.max(0, Math.min(canvasW - actualW, centerX + offsetX));
    const finalTop = Math.max(0, Math.min(canvasH - actualH, centerY + offsetY));
    const compositeLayers = [];
    // 5. Optional Contact Shadow Layer underneath the product base
    if (contactShadow) {
        const shadowW = Math.round(actualW * 0.88);
        const shadowH = Math.max(16, Math.round(actualH * 0.12));
        const shadowSvg = `
      <svg width="${shadowW}" height="${shadowH}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${shadowW / 2}" cy="${shadowH / 2}" rx="${shadowW * 0.44}" ry="${shadowH * 0.38}" fill="rgba(0, 0, 0, 0.65)" filter="blur(16px)" />
      </svg>
    `;
        const shadowBuffer = await (0, sharp_1.default)(Buffer.from(shadowSvg)).png().toBuffer();
        const shadowLeft = Math.round(finalLeft + (actualW - shadowW) / 2);
        const shadowTop = Math.round(finalTop + actualH - shadowH * 0.65);
        // Keep shadow within canvas bounds
        const safeShadowLeft = Math.max(0, Math.min(canvasW - shadowW, shadowLeft));
        const safeShadowTop = Math.max(0, Math.min(canvasH - shadowH, shadowTop));
        compositeLayers.push({
            input: shadowBuffer,
            top: safeShadowTop,
            left: safeShadowLeft,
        });
    }
    // 6. Optional Ambient Color Matching / Rim Bounce (non-destructive)
    if (colorMatch) {
        // Soft subtle rim back-glow behind the product silhouette
        const glowW = Math.round(actualW * 1.05);
        const glowH = Math.round(actualH * 1.05);
        const glowSvg = `
      <svg width="${glowW}" height="${glowH}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${glowW / 2}" cy="${glowH / 2}" rx="${glowW * 0.46}" ry="${glowH * 0.46}" fill="rgba(255, 230, 180, 0.12)" filter="blur(24px)" />
      </svg>
    `;
        const glowBuffer = await (0, sharp_1.default)(Buffer.from(glowSvg)).png().toBuffer();
        const glowLeft = Math.max(0, Math.min(canvasW - glowW, Math.round(finalLeft - (glowW - actualW) / 2)));
        const glowTop = Math.max(0, Math.min(canvasH - glowH, Math.round(finalTop - (glowH - actualH) / 2)));
        compositeLayers.push({
            input: glowBuffer,
            top: glowTop,
            left: glowLeft,
        });
    }
    // 7. Product Layer (original pixels untouched)
    compositeLayers.push({
        input: resizedProductBuffer,
        top: finalTop,
        left: finalLeft,
    });
    // 8. Execute Composite with Sharp
    let pipeline = (0, sharp_1.default)(background).composite(compositeLayers);
    if (outputFormat === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: 92 });
    }
    else if (outputFormat === 'webp') {
        pipeline = pipeline.webp({ quality: 92 });
    }
    else {
        pipeline = pipeline.png({ compressionLevel: 8 });
    }
    const finalBuffer = await pipeline.toBuffer();
    const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
    return {
        imageBuffer: finalBuffer,
        mimeType,
        width: canvasW,
        height: canvasH,
    };
}
//# sourceMappingURL=compositing.service.js.map