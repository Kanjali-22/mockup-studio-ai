import { describe, it, expect } from 'vitest';
import {
  buildPrompt,
  validateGenerationParams,
  formatFileSize,
  getImageExtension,
} from './promptBuilder';

describe('buildPrompt', () => {
  it('builds a prompt with category and custom user prompt', () => {
    const result = buildPrompt({
      userPrompt: 'resting on an oak pedestal',
      category: 'perfume',
    });

    expect(result).toContain('perfume & fragrance');
    expect(result).toContain('resting on an oak pedestal');
  });

  it('incorporates scene preset details', () => {
    const result = buildPrompt({
      userPrompt: 'black marble floor',
      scenePreset: 'luxury-studio',
    });

    expect(result).toContain('luxury product photography');
    expect(result).toContain('black marble floor');
  });

  it('adds category-specific enhancement suffix when enhance=true', () => {
    const result = buildPrompt({
      userPrompt: 'a dropper bottle',
      category: 'cosmetics-skincare',
      enhance: true,
    });

    expect(result).toContain('luxury beauty advertising');
  });
});

describe('validateGenerationParams', () => {
  it('fails if no product image is provided', () => {
    const errors = validateGenerationParams(
      { prompt: 'a nice perfume bottle', aspectRatio: '1:1', model: 'stable-image-core' },
      false
    );
    expect(errors).toContain('Please upload a product image before generating.');
  });

  it('fails if prompt is empty', () => {
    const errors = validateGenerationParams(
      { prompt: '   ', aspectRatio: '1:1', model: 'stable-image-core' },
      true
    );
    expect(errors).toContain('Please enter a scene description (at least 3 characters).');
  });

  it('succeeds with valid parameters and image', () => {
    const errors = validateGenerationParams(
      { prompt: 'a beautiful watch on marble', aspectRatio: '1:1', model: 'stable-image-core' },
      true
    );
    expect(errors.length).toBe(0);
  });
});

describe('formatting helpers', () => {
  it('formats file sizes accurately', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('identifies correct image extensions', () => {
    expect(getImageExtension('image/jpeg')).toBe('jpg');
    expect(getImageExtension('image/png')).toBe('png');
    expect(getImageExtension('image/webp')).toBe('webp');
  });
});
