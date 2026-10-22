"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageHasTransparency = imageHasTransparency;
exports.removeBackground = removeBackground;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const sharp_1 = __importDefault(require("sharp"));
const errorHandler_1 = require("../middleware/errorHandler");
const STABILITY_REMOVE_BG_ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/edit/remove-background';
/**
 * Checks whether an image buffer already has meaningful alpha transparency.
 */
async function imageHasTransparency(buffer) {
    try {
        const meta = await (0, sharp_1.default)(buffer).metadata();
        if (!meta.hasAlpha)
            return false;
        const stats = await (0, sharp_1.default)(buffer).stats();
        if (stats.channels.length >= 4) {
            const alphaChannel = stats.channels[3];
            // If minimum alpha is below 250, there are transparent pixels
            return alphaChannel.min < 250;
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Removes the background from a product image to produce a transparent PNG.
 * Uses Stability AI's Stable Image Remove Background API.
 * If the image already has transparency, it returns the buffer directly.
 * If background removal is required but no API key is configured, throws an actionable error.
 */
async function removeBackground(imageBuffer, force = false) {
    // If the image already has transparency and removal is not forced, return as-is
    if (!force) {
        const alreadyTransparent = await imageHasTransparency(imageBuffer);
        if (alreadyTransparent) {
            return (0, sharp_1.default)(imageBuffer).png().toBuffer();
        }
    }
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
        throw (0, errorHandler_1.createError)('Background removal service is not configured. Set STABILITY_API_KEY in server/.env or upload an image with a transparent background.', 503, 'BACKGROUND_REMOVAL_UNAVAILABLE');
    }
    // Ensure image dimensions comply with Stability API constraints
    // Sides must be at least 64px, and total pixels between 4,096 and 4,194,304
    let preparedBuffer = imageBuffer;
    const meta = await (0, sharp_1.default)(imageBuffer).metadata();
    if (meta.width && meta.height) {
        const totalPixels = meta.width * meta.height;
        if (totalPixels > 4_194_304 || meta.width > 2048 || meta.height > 2048) {
            preparedBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize(1536, 1536, { fit: 'inside' })
                .png()
                .toBuffer();
        }
    }
    const form = new form_data_1.default();
    form.append('image', preparedBuffer, {
        filename: 'product.png',
        contentType: 'image/png',
    });
    form.append('output_format', 'png');
    try {
        const response = await axios_1.default.post(STABILITY_REMOVE_BG_ENDPOINT, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
            },
            timeout: 120_000,
            maxContentLength: 50 * 1024 * 1024,
        });
        const data = response.data;
        if (!data.image) {
            throw (0, errorHandler_1.createError)('Background removal service returned empty image.', 502, 'PROVIDER_ERROR');
        }
        return Buffer.from(data.image, 'base64');
    }
    catch (err) {
        const axiosErr = err;
        if (axiosErr.response) {
            const status = axiosErr.response.status;
            const body = axiosErr.response.data;
            const message = typeof body?.message === 'string' ? body.message : 'Removal failed';
            if (status === 402 || message.toLowerCase().includes('credit')) {
                throw (0, errorHandler_1.createError)('Insufficient Stability AI credits for background removal.', 402, 'INSUFFICIENT_CREDITS');
            }
            throw (0, errorHandler_1.createError)(`Background removal failed (HTTP ${status}): ${message}`, status >= 500 ? 502 : 400, 'BACKGROUND_REMOVAL_FAILED');
        }
        if (axiosErr.code === 'ECONNABORTED') {
            throw (0, errorHandler_1.createError)('Background removal timed out.', 504, 'TIMEOUT');
        }
        throw (0, errorHandler_1.createError)('Network error connecting to background removal service.', 503, 'NETWORK_ERROR');
    }
}
//# sourceMappingURL=backgroundRemoval.service.js.map