export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type OutputFormat = 'png' | 'jpeg' | 'webp';
export type ModelId = 'stable-image-core' | 'stable-image-ultra';

export type ProductCategory =
  | 'cosmetics-skincare'
  | 'perfume'
  | 'food-beverage'
  | 'electronics'
  | 'fashion-accessories'
  | 'jewelry'
  | 'home-furniture'
  | 'health-wellness'
  | 'custom';

export type ScenePreset =
  | 'luxury-studio'
  | 'minimal-white'
  | 'nature-botanical'
  | 'marble-premium'
  | 'futuristic-display'
  | 'festive-advertising'
  | 'outdoor-lifestyle'
  | 'ecommerce-catalog'
  | 'cinematic-dark'
  | 'custom';

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  description: string;
  widthRatio: number;
  heightRatio: number;
}

export interface ScenePresetOption {
  id: ScenePreset;
  label: string;
  description: string;
  promptTemplate: string;
  lightingHint: string;
}

export interface CategoryOption {
  id: ProductCategory;
  label: string;
  icon: string;
}

export interface ModelOption {
  id: ModelId;
  name: string;
  description: string;
  creditCost: string;
  supportedAspectRatios: AspectRatio[];
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  model: ModelId;
  outputFormat: OutputFormat;
  seed?: number;
  strength: number;
  category?: ProductCategory;
  scenePreset?: ScenePreset;
  workflow?: 'relight' | 'composite' | 'auto';
  removeBackground?: boolean;
  productScale?: number;
  positionX?: number;
  positionY?: number;
  contactShadow?: boolean;
  colorMatch?: boolean;
  debug?: boolean;
}

export interface GenerationResult {
  imageBase64: string;
  mimeType: string;
  seed?: number;
  model: string;
  prompt: string;
  aspectRatio: AspectRatio;
  outputFormat: OutputFormat;
  generatedAt: string;
  workflowUsed?: 'replace-background-and-relight' | 'remove-background-and-composite';
  productPreserved?: boolean;
  debugInfo?: {
    workflow: string;
    endpointCalled: string;
    durationMs: number;
    pollCount?: number;
  };
}

export interface Creation {
  id: string;
  imageBase64: string;
  mimeType: string;
  prompt: string;
  aspectRatio: AspectRatio;
  model: string;
  seed?: number;
  createdAt: string;
  productImageName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  api: {
    stabilityConfigured: boolean;
    stabilityKeyHint: string | null;
  };
  limits: {
    maxFileSizeMB: number;
    rateLimitMax: number;
    rateLimitWindowMs: number;
  };
}
