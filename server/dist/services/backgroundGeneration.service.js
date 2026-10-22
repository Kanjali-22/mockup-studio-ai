"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackgroundScene = generateBackgroundScene;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const errorHandler_1 = require("../middleware/errorHandler");
const STABILITY_API_BASE = 'https://api.stability.ai/v2beta/stable-image/generate';
const MODEL_ENDPOINTS = {
    'stable-image-core': `${STABILITY_API_BASE}/core`,
    'stable-image-ultra': `${STABILITY_API_BASE}/ultra`,
};
/**
 * Transforms user scene prompt into a pristine background generation prompt.
 * Ensures the generated scene has an empty podium/surface for compositing
 * and excludes unwanted AI-invented products.
 */
function buildBackgroundPrompt(userPrompt) {
    const cleanPrompt = `${userPrompt.trim()}, empty display pedestal, pristine product showcase stage, professional studio environment, commercial advertising background`;
    const defaultNegative = 'products, bottles, perfume, cosmetics, cans, packaging, shoes, electronics, watches, cups, logos, text, watermark, people, hands, cluttered, blurry, distorted';
    return {
        prompt: cleanPrompt,
        negativePrompt: defaultNegative,
    };
}
async function generateBackgroundScene(params) {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
        throw (0, errorHandler_1.createError)('Stability AI API key is not configured. Set STABILITY_API_KEY in server/.env', 503, 'API_KEY_MISSING');
    }
    const endpoint = MODEL_ENDPOINTS[params.model] || MODEL_ENDPOINTS['stable-image-core'];
    const { prompt, negativePrompt } = buildBackgroundPrompt(params.prompt);
    const fullNegative = params.negativePrompt
        ? `${params.negativePrompt}, ${negativePrompt}`
        : negativePrompt;
    const form = new form_data_1.default();
    form.append('prompt', prompt);
    form.append('negative_prompt', fullNegative);
    form.append('aspect_ratio', params.aspectRatio);
    form.append('output_format', 'png');
    if (params.seed !== undefined) {
        form.append('seed', String(params.seed));
    }
    try {
        const response = await axios_1.default.post(endpoint, form, {
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
            throw (0, errorHandler_1.createError)('Provider returned success status but no background image data.', 502, 'PROVIDER_NO_IMAGE');
        }
        return {
            buffer: Buffer.from(data.image, 'base64'),
            seed: data.seed,
        };
    }
    catch (err) {
        const axiosErr = err;
        if (axiosErr.response) {
            const status = axiosErr.response.status;
            const body = axiosErr.response.data;
            const providerMessage = typeof body?.message === 'string'
                ? body.message
                : typeof body?.errors === 'object'
                    ? JSON.stringify(body.errors)
                    : 'Unknown error';
            if (status === 401) {
                throw (0, errorHandler_1.createError)('Invalid Stability AI API key.', 401, 'INVALID_API_KEY');
            }
            if (status === 402 || (typeof providerMessage === 'string' && providerMessage.toLowerCase().includes('credit'))) {
                throw (0, errorHandler_1.createError)('Insufficient Stability AI credits. Please top up your account.', 402, 'INSUFFICIENT_CREDITS');
            }
            if (status === 429) {
                throw (0, errorHandler_1.createError)('Rate limit exceeded. Please wait a moment.', 429, 'PROVIDER_RATE_LIMIT');
            }
            throw (0, errorHandler_1.createError)(`Background generation failed (HTTP ${status}): ${providerMessage}`, 502, 'PROVIDER_ERROR');
        }
        if (axiosErr.code === 'ECONNABORTED') {
            throw (0, errorHandler_1.createError)('Background generation timed out.', 504, 'TIMEOUT');
        }
        throw (0, errorHandler_1.createError)('Network error connecting to Stability AI.', 503, 'NETWORK_ERROR');
    }
}
//# sourceMappingURL=backgroundGeneration.service.js.map