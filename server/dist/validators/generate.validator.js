"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestSchema = exports.SUPPORTED_OUTPUT_FORMATS = exports.SUPPORTED_MODELS = exports.SUPPORTED_ASPECT_RATIOS = void 0;
const zod_1 = require("zod");
exports.SUPPORTED_ASPECT_RATIOS = [
    '1:1',
    '3:4',
    '4:3',
    '9:16',
    '16:9',
    '21:9',
];
exports.SUPPORTED_MODELS = [
    'stable-image-core',
    'stable-image-ultra',
];
exports.SUPPORTED_OUTPUT_FORMATS = ['png', 'jpeg', 'webp'];
const booleanCoerce = (defaultValue = true) => zod_1.z.preprocess((val) => {
    if (typeof val === 'string')
        return val.toLowerCase() === 'true' || val === '1';
    if (typeof val === 'boolean')
        return val;
    return defaultValue;
}, zod_1.z.boolean()).default(defaultValue);
exports.generateRequestSchema = zod_1.z.object({
    prompt: zod_1.z
        .string()
        .min(3, 'Prompt must be at least 3 characters')
        .max(10000, 'Prompt must not exceed 10,000 characters'),
    negativePrompt: zod_1.z
        .string()
        .max(2000, 'Negative prompt must not exceed 2,000 characters')
        .optional(),
    aspectRatio: zod_1.z.enum(exports.SUPPORTED_ASPECT_RATIOS, {
        errorMap: () => ({ message: `Aspect ratio must be one of: ${exports.SUPPORTED_ASPECT_RATIOS.join(', ')}` }),
    }),
    model: zod_1.z.enum(exports.SUPPORTED_MODELS, {
        errorMap: () => ({ message: `Model must be one of: ${exports.SUPPORTED_MODELS.join(', ')}` }),
    }).default('stable-image-core'),
    outputFormat: zod_1.z.enum(exports.SUPPORTED_OUTPUT_FORMATS).default('png'),
    seed: zod_1.z.coerce
        .number()
        .int()
        .min(0)
        .max(4294967294)
        .optional(),
    strength: zod_1.z.coerce
        .number()
        .min(0)
        .max(1)
        .default(0.65),
    category: zod_1.z.string().max(100).optional(),
    scenePreset: zod_1.z.string().max(100).optional(),
    // Product compositing controls
    removeBackground: booleanCoerce(true),
    productScale: zod_1.z.coerce.number().min(0.1).max(1.0).default(0.65),
    positionX: zod_1.z.coerce.number().min(-50).max(50).default(0),
    positionY: zod_1.z.coerce.number().min(-50).max(50).default(0),
    contactShadow: booleanCoerce(true),
    colorMatch: booleanCoerce(false),
    // Workflow and debug controls
    workflow: zod_1.z.enum(['relight', 'composite', 'auto']).default('auto'),
    debug: booleanCoerce(false),
});
//# sourceMappingURL=generate.validator.js.map