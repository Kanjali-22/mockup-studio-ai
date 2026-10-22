import type {
  AspectRatioOption,
  CategoryOption,
  ScenePresetOption,
  ModelOption,
  GenerationParams,
  AspectRatio,
  ScenePreset,
} from '../types';

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    value: '1:1',
    label: 'Square',
    description: 'Instagram Post',
    widthRatio: 1,
    heightRatio: 1,
  },
  {
    value: '3:4',
    label: 'Portrait',
    description: 'Product Shot',
    widthRatio: 3,
    heightRatio: 4,
  },
  {
    value: '4:3',
    label: 'Landscape',
    description: 'Blog / Web',
    widthRatio: 4,
    heightRatio: 3,
  },
  {
    value: '9:16',
    label: 'Story / Reel',
    description: 'Instagram Story',
    widthRatio: 9,
    heightRatio: 16,
  },
  {
    value: '16:9',
    label: 'Widescreen',
    description: 'YouTube / Banner',
    widthRatio: 16,
    heightRatio: 9,
  },
  {
    value: '21:9',
    label: 'Wide Banner',
    description: 'Hero / Display',
    widthRatio: 21,
    heightRatio: 9,
  },
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'cosmetics-skincare', label: 'Cosmetics & Skincare', icon: '✨' },
  { id: 'perfume', label: 'Perfume & Fragrance', icon: '🌸' },
  { id: 'food-beverage', label: 'Food & Beverage', icon: '🍃' },
  { id: 'electronics', label: 'Electronics', icon: '⚡' },
  { id: 'fashion-accessories', label: 'Fashion & Accessories', icon: '👜' },
  { id: 'jewelry', label: 'Jewelry', icon: '💎' },
  { id: 'home-furniture', label: 'Home & Furniture', icon: '🏠' },
  { id: 'health-wellness', label: 'Health & Wellness', icon: '🌿' },
  { id: 'custom', label: 'Custom / Other', icon: '🎨' },
];

export const SCENE_PRESET_OPTIONS: ScenePresetOption[] = [
  {
    id: 'luxury-studio',
    label: 'Luxury Studio',
    description: 'Rich textures, premium lighting',
    promptTemplate:
      'luxury product photography, elegant studio setup, velvet surface, dramatic side lighting, rich shadows, premium editorial aesthetic, cinematic composition',
    lightingHint: 'Dramatic side lighting',
  },
  {
    id: 'minimal-white',
    label: 'Minimal White Studio',
    description: 'Clean, bright, e-commerce ready',
    promptTemplate:
      'clean minimal product photography, pure white background, soft diffused lighting, even shadows, crisp product details, commercial photography',
    lightingHint: 'Soft diffused lighting',
  },
  {
    id: 'nature-botanical',
    label: 'Nature & Botanical',
    description: 'Organic, fresh, natural',
    promptTemplate:
      'natural product photography, soft botanical background, green leaves, natural daylight, earthy textures, organic lifestyle aesthetic',
    lightingHint: 'Natural daylight',
  },
  {
    id: 'marble-premium',
    label: 'Marble & Premium',
    description: 'Sophisticated, high-end',
    promptTemplate:
      'premium product photography, white and grey marble surface, golden accents, elegant reflections, luxury beauty advertising, sophisticated composition',
    lightingHint: 'Studio rim lighting',
  },
  {
    id: 'futuristic-display',
    label: 'Futuristic Display',
    description: 'Tech, modern, bold',
    promptTemplate:
      'futuristic product showcase, dark background, glowing elements, modern tech aesthetic, floating display, dramatic studio lighting',
    lightingHint: 'Dramatic back lighting',
  },
  {
    id: 'festive-advertising',
    label: 'Festive Advertising',
    description: 'Celebratory, warm, seasonal',
    promptTemplate:
      'festive product advertising, warm golden bokeh background, holiday mood, rich warm tones, gift presentation, celebration aesthetic',
    lightingHint: 'Warm golden lighting',
  },
  {
    id: 'outdoor-lifestyle',
    label: 'Outdoor Lifestyle',
    description: 'Active, real, relatable',
    promptTemplate:
      'lifestyle product photography, outdoor natural setting, sunlight, organic environment, authentic feel, brand story aesthetic',
    lightingHint: 'Natural sunlight',
  },
  {
    id: 'ecommerce-catalog',
    label: 'E-commerce Catalog',
    description: 'Clear, versatile, conversion-focused',
    promptTemplate:
      'product catalog photography, neutral background, even lighting, no shadows, clean product display, sharp details, web-ready',
    lightingHint: 'Even flat lighting',
  },
  {
    id: 'cinematic-dark',
    label: 'Cinematic Dark',
    description: 'Moody, dramatic, editorial',
    promptTemplate:
      'cinematic product photography, dark moody background, dramatic rim lighting, deep shadows, film-like atmosphere, editorial magazine aesthetic',
    lightingHint: 'Rim/edge lighting',
  },
  {
    id: 'custom',
    label: 'Custom Scene',
    description: 'Write your own scene',
    promptTemplate: '',
    lightingHint: 'Your choice',
  },
];

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'stable-image-core',
    name: 'Stable Image Core',
    description: 'Fast, cost-effective. Great for iterations.',
    creditCost: 'See platform.stability.ai',
    supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'],
  },
  {
    id: 'stable-image-ultra',
    name: 'Stable Image Ultra',
    description: 'State-of-the-art photorealism. Best quality.',
    creditCost: 'See platform.stability.ai',
    supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'],
  },
];

export function getScenePreset(id: ScenePreset): ScenePresetOption | undefined {
  return SCENE_PRESET_OPTIONS.find((p) => p.id === id);
}

export function getAspectRatioOption(value: AspectRatio): AspectRatioOption | undefined {
  return ASPECT_RATIO_OPTIONS.find((a) => a.value === value);
}

export const DEFAULT_PARAMS: Partial<GenerationParams> = {
  aspectRatio: '1:1',
  model: 'stable-image-core',
  outputFormat: 'png',
  strength: 0.65,
};
