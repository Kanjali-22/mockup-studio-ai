import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { createError } from '../middleware/errorHandler';

const STABILITY_REMOVE_BG_ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/edit/remove-background';

/**
 * Checks whether an image buffer already has meaningful alpha transparency.
 */
export async function imageHasTransparency(buffer: Buffer): Promise<boolean> {
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.hasAlpha) return false;

    const stats = await sharp(buffer).stats();
    if (stats.channels.length >= 4) {
      const alphaChannel = stats.channels[3];
      // If minimum alpha is below 250, there are transparent pixels
      return alphaChannel.min < 250;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Removes the background from a product image to produce a transparent PNG.
 * Uses Stability AI's Stable Image Remove Background API.
 * If the image already has transparency, it returns the buffer directly.
 * If background removal is required but no API key is configured, throws an actionable error.
 */
export async function removeBackground(
  imageBuffer: Buffer,
  force = false
): Promise<Buffer> {
  // If the image already has transparency and removal is not forced, return as-is
  if (!force) {
    const alreadyTransparent = await imageHasTransparency(imageBuffer);
    if (alreadyTransparent) {
      return sharp(imageBuffer).png().toBuffer();
    }
  }

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw createError(
      'Background removal service is not configured. Set STABILITY_API_KEY in server/.env or upload an image with a transparent background.',
      503,
      'BACKGROUND_REMOVAL_UNAVAILABLE'
    );
  }

  // Ensure image dimensions comply with Stability API constraints
  // Sides must be at least 64px, and total pixels between 4,096 and 4,194,304
  let preparedBuffer = imageBuffer;
  const meta = await sharp(imageBuffer).metadata();
  if (meta.width && meta.height) {
    const totalPixels = meta.width * meta.height;
    if (totalPixels > 4_194_304 || meta.width > 2048 || meta.height > 2048) {
      preparedBuffer = await sharp(imageBuffer)
        .resize(1536, 1536, { fit: 'inside' })
        .png()
        .toBuffer();
    }
  }

  const form = new FormData();
  form.append('image', preparedBuffer, {
    filename: 'product.png',
    contentType: 'image/png',
  });
  form.append('output_format', 'png');

  try {
    const response = await axios.post(STABILITY_REMOVE_BG_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      timeout: 120_000,
      maxContentLength: 50 * 1024 * 1024,
    });

    const data = response.data as { image?: string };
    if (!data.image) {
      throw createError(
        'Background removal service returned empty image.',
        502,
        'PROVIDER_ERROR'
      );
    }

    return Buffer.from(data.image, 'base64');
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      const status = axiosErr.response.status;
      const body = axiosErr.response.data as Record<string, unknown>;
      const message = typeof body?.message === 'string' ? body.message : 'Removal failed';

      if (status === 402 || message.toLowerCase().includes('credit')) {
        throw createError(
          'Insufficient Stability AI credits for background removal.',
          402,
          'INSUFFICIENT_CREDITS'
        );
      }

      throw createError(
        `Background removal failed (HTTP ${status}): ${message}`,
        status >= 500 ? 502 : 400,
        'BACKGROUND_REMOVAL_FAILED'
      );
    }

    if (axiosErr.code === 'ECONNABORTED') {
      throw createError('Background removal timed out.', 504, 'TIMEOUT');
    }

    throw createError(
      'Network error connecting to background removal service.',
      503,
      'NETWORK_ERROR'
    );
  }
}
