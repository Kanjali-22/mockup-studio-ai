import { z } from 'zod';

export const SUPPORTED_ASPECT_RATIOS = [
  '1:1',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '21:9',
] as const;

export const SUPPORTED_MODELS = [
  'stable-image-core',
  'stable-image-ultra',
] as const;

export const SUPPORTED_OUTPUT_FORMATS = ['png', 'jpeg', 'webp'] as const;

const booleanCoerce = (defaultValue = true) =>
  z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
    if (typeof val === 'boolean') return val;
    return defaultValue;
  }, z.boolean()).default(defaultValue);

export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters')
    .max(10000, 'Prompt must not exceed 10,000 characters'),
  negativePrompt: z
    .string()
    .max(2000, 'Negative prompt must not exceed 2,000 characters')
    .optional(),
  aspectRatio: z.enum(SUPPORTED_ASPECT_RATIOS, {
    errorMap: () => ({ message: `Aspect ratio must be one of: ${SUPPORTED_ASPECT_RATIOS.join(', ')}` }),
  }),
  model: z.enum(SUPPORTED_MODELS, {
    errorMap: () => ({ message: `Model must be one of: ${SUPPORTED_MODELS.join(', ')}` }),
  }).default('stable-image-core'),
  outputFormat: z.enum(SUPPORTED_OUTPUT_FORMATS).default('png'),
  seed: z.coerce
    .number()
    .int()
    .min(0)
    .max(4294967294)
    .optional(),
  strength: z.coerce
    .number()
    .min(0)
    .max(1)
    .default(0.65),
  category: z.string().max(100).optional(),
  scenePreset: z.string().max(100).optional(),
  // Product compositing controls
  removeBackground: booleanCoerce(true),
  productScale: z.coerce.number().min(0.1).max(1.0).default(0.65),
  positionX: z.coerce.number().min(-50).max(50).default(0),
  positionY: z.coerce.number().min(-50).max(50).default(0),
  contactShadow: booleanCoerce(true),
  colorMatch: booleanCoerce(false),
  // Workflow and debug controls
  workflow: z.enum(['relight', 'composite', 'auto']).default('auto'),
  debug: booleanCoerce(false),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
