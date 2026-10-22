"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoutes = void 0;
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const generate_validator_1 = require("../validators/generate.validator");
const stability_service_1 = require("../services/stability.service");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const multer_1 = __importDefault(require("multer"));
exports.generateRoutes = (0, express_1.Router)();
exports.generateRoutes.post('/generate', (req, res, next) => {
    upload_1.uploadMiddleware.single('image')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next((0, errorHandler_1.createError)(`File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`, 413, 'FILE_TOO_LARGE'));
            }
            return next((0, errorHandler_1.createError)(err.message, 400, 'UPLOAD_ERROR'));
        }
        if (err)
            return next(err);
        next();
    });
}, async (req, res, next) => {
    const file = req.file;
    try {
        // Validate that a file was uploaded
        if (!file) {
            throw (0, errorHandler_1.createError)('No product image provided. Please upload a PNG, JPEG, or WebP file.', 400, 'NO_IMAGE');
        }
        // Parse and validate request body
        const parseResult = generate_validator_1.generateRequestSchema.safeParse(req.body);
        if (!parseResult.success) {
            (0, stability_service_1.cleanupFile)(file.path);
            const issues = parseResult.error.issues
                .map((i) => i.message)
                .join('; ');
            throw (0, errorHandler_1.createError)(`Validation failed: ${issues}`, 400, 'VALIDATION_ERROR');
        }
        const params = parseResult.data;
        // Call Stability AI
        const result = await (0, stability_service_1.generateImage)(file.path, params);
        // Clean up temp file after successful generation
        (0, stability_service_1.cleanupFile)(file.path);
        res.json({
            success: true,
            data: {
                imageBase64: result.imageBase64,
                mimeType: result.mimeType,
                seed: result.seed,
                model: result.model,
                prompt: result.prompt,
                aspectRatio: params.aspectRatio,
                outputFormat: params.outputFormat,
                workflowUsed: result.workflowUsed,
                productPreserved: result.productPreserved,
                debugInfo: result.debugInfo,
                generatedAt: new Date().toISOString(),
            },
        });
    }
    catch (err) {
        // Ensure temp file is cleaned up on error too
        if (file?.path)
            (0, stability_service_1.cleanupFile)(file.path);
        if (err instanceof zod_1.ZodError) {
            const issues = err.issues.map((i) => i.message).join('; ');
            return next((0, errorHandler_1.createError)(`Validation error: ${issues}`, 400, 'VALIDATION_ERROR'));
        }
        next(err);
    }
});
//# sourceMappingURL=generate.routes.js.map