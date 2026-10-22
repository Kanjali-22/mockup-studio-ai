import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { createError } from '../middleware/errorHandler';
import type { AspectRatio, ModelId, OutputFormat } from '../types';

const STABILITY_API_BASE = 'https://api.stability.ai/v2beta/stable-image/generate';

const MODEL_ENDPOINTS: Record<string, string> = {
  'stable-image-core': `${STABILITY_API_BASE}/core`,
  'stable-image-ultra': `${STABILITY_API_BASE}/ultra`,
};

export interface BackgroundGenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  model: ModelId;
  seed?: number;
  outputFormat?: OutputFormat;
}

/**
 * Transforms user scene prompt into a pristine background generation prompt.
 * Ensures the generated scene has an empty podium/surface for compositing
 * and excludes unwanted AI-invented products.
 */
function buildBackgroundPrompt(userPrompt: string): { prompt: string; negativePrompt: string } {
  const cleanPrompt = `${userPrompt.trim()}, empty display pedestal, pristine product showcase stage, professional studio environment, commercial advertising background`;

  const defaultNegative =
    'products, bottles, perfume, cosmetics, cans, packaging, shoes, electronics, watches, cups, logos, text, watermark, people, hands, cluttered, blurry, distorted';

  return {
    prompt: cleanPrompt,
    negativePrompt: defaultNegative,
  };
}

export async function generateBackgroundScene(
  params: BackgroundGenerationParams
): Promise<{ buffer: Buffer; seed?: number }> {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw createError(
      'Stability AI API key is not configured. Set STABILITY_API_KEY in server/.env',
      503,
      'API_KEY_MISSING'
    );
  }

  const endpoint = MODEL_ENDPOINTS[params.model] || MODEL_ENDPOINTS['stable-image-core'];
  const { prompt, negativePrompt } = buildBackgroundPrompt(params.prompt);

  const fullNegative = params.negativePrompt
    ? `${params.negativePrompt}, ${negativePrompt}`
    : negativePrompt;

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('negative_prompt', fullNegative);
  form.append('aspect_ratio', params.aspectRatio);
  form.append('output_format', 'png');

  if (params.seed !== undefined) {
    form.append('seed', String(params.seed));
  }

  try {
    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      timeout: 120_000,
      maxContentLength: 50 * 1024 * 1024,
    });

    const data = response.data as { image?: string; seed?: number };
    if (!data.image) {
      throw createError(
        'Provider returned success status but no background image data.',
        502,
        'PROVIDER_NO_IMAGE'
      );
    }

    return {
      buffer: Buffer.from(data.image, 'base64'),
      seed: data.seed,
    };
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      const status = axiosErr.response.status;
      const body = axiosErr.response.data as Record<string, unknown>;
      const providerMessage =
        typeof body?.message === 'string'
          ? body.message
          : typeof body?.errors === 'object'
          ? JSON.stringify(body.errors)
          : 'Unknown error';

      if (status === 401) {
        throw createError('Invalid Stability AI API key.', 401, 'INVALID_API_KEY');
      }
      if (status === 402 || (typeof providerMessage === 'string' && providerMessage.toLowerCase().includes('credit'))) {
        throw createError(
          'Insufficient Stability AI credits. Please top up your account.',
          402,
          'INSUFFICIENT_CREDITS'
        );
      }
      if (status === 429) {
        throw createError('Rate limit exceeded. Please wait a moment.', 429, 'PROVIDER_RATE_LIMIT');
      }

      throw createError(
        `Background generation failed (HTTP ${status}): ${providerMessage}`,
        502,
        'PROVIDER_ERROR'
      );
    }

    if (axiosErr.code === 'ECONNABORTED') {
      throw createError('Background generation timed out.', 504, 'TIMEOUT');
    }

    throw createError(
      'Network error connecting to Stability AI.',
      503,
      'NETWORK_ERROR'
    );
  }
}
