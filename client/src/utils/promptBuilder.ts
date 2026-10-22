import type {
  GenerationParams,
  ProductCategory,
  ScenePreset,
} from '../types';
import { getScenePreset, CATEGORY_OPTIONS } from './constants';

interface PromptBuildOptions {
  userPrompt: string;
  category?: ProductCategory;
  scenePreset?: ScenePreset;
  enhance?: boolean;
}

function getCategoryLabel(category?: ProductCategory): string {
  if (!category) return 'product';
  const found = CATEGORY_OPTIONS.find((c) => c.id === category);
  return found ? found.label.toLowerCase() : 'product';
}

function getEnhancementSuffix(category?: ProductCategory): string {
  const enhancements: Record<string, string> = {
    'cosmetics-skincare': 'accurate material reflections, crisp product details, luxury beauty advertising, commercial photography quality',
    'perfume': 'glass reflections, crisp product details, premium fragrance advertising, commercial photography quality',
    'food-beverage': 'fresh appetite-appeal, crisp product details, food styling, commercial photography quality',
    'electronics': 'technical precision, crisp product details, tech advertising, commercial photography quality',
    'fashion-accessories': 'texture detail, material authenticity, fashion editorial quality, commercial photography',
    'jewelry': 'gem sparkle, metal reflections, crisp product details, luxury jewelry advertising quality',
    'home-furniture': 'interior context, material texture, lifestyle photography quality',
    'health-wellness': 'clean natural tones, crisp product details, wellness lifestyle quality',
    'custom': 'crisp product details, professional photography quality',
  };
  return enhancements[category || 'custom'] || 'crisp product details, professional photography quality';
}

/**
 * Builds a structured prompt from user inputs and presets.
 * Uses deterministic templates only — does not call any external AI.
 */
export function buildPrompt(options: PromptBuildOptions): string {
  const { userPrompt, category, scenePreset, enhance } = options;
  const parts: string[] = [];

  // 1. Category/product context
  const categoryLabel = getCategoryLabel(category);
  parts.push(`Professional ${categoryLabel} product photography`);

  // 2. Scene preset context (if not custom and not already described by user)
  if (scenePreset && scenePreset !== 'custom') {
    const preset = getScenePreset(scenePreset);
    if (preset?.promptTemplate) {
      parts.push(preset.promptTemplate);
    }
  }

  // 3. User's own prompt (core intent — always included)
  if (userPrompt.trim()) {
    parts.push(userPrompt.trim());
  }

  // 4. Enhancement suffix (only when enhance=true)
  if (enhance) {
    parts.push(getEnhancementSuffix(category));
    parts.push('preserve original product shape and packaging, realistic contact shadows, accurate product proportions');
  }

  // Deduplicate and clean
  const combined = parts.join(', ');
  // Remove consecutive duplicate phrases
  return combined.replace(/, ,/g, ',').replace(/\s+/g, ' ').trim();
}

/**
 * Validates generation parameters on the client side before submission.
 */
export function validateGenerationParams(
  params: Partial<GenerationParams>,
  hasFile: boolean
): string[] {
  const errors: string[] = [];

  if (!hasFile) {
    errors.push('Please upload a product image before generating.');
  }

  if (!params.prompt || params.prompt.trim().length < 3) {
    errors.push('Please enter a scene description (at least 3 characters).');
  }

  if (params.prompt && params.prompt.length > 10000) {
    errors.push('Prompt must not exceed 10,000 characters.');
  }

  if (!params.aspectRatio) {
    errors.push('Please select an aspect ratio.');
  }

  if (!params.model) {
    errors.push('Please select a generation model.');
  }

  if (
    params.seed !== undefined &&
    params.seed !== null &&
    (isNaN(params.seed) || params.seed < 0 || params.seed > 4294967294)
  ) {
    errors.push('Seed must be a number between 0 and 4,294,967,294.');
  }

  return errors;
}

/**
 * Formats a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts a base64 image string to a downloadable blob URL.
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64);
  const buffer = new ArrayBuffer(byteString.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < byteString.length; i++) {
    view[i] = byteString.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeType });
}

export function downloadImage(
  base64: string,
  mimeType: string,
  filename: string
): void {
  const blob = base64ToBlob(base64, mimeType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getImageExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'png';
}
