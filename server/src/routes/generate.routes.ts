import { Router, Request, Response, NextFunction } from 'express';
import { uploadMiddleware } from '../middleware/upload';
import { generateRequestSchema } from '../validators/generate.validator';
import { generateImage, cleanupFile } from '../services/stability.service';
import { ZodError } from 'zod';
import { createError } from '../middleware/errorHandler';
import multer from 'multer';

export const generateRoutes = Router();

generateRoutes.post(
  '/generate',
  (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(createError(
            `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`,
            413,
            'FILE_TOO_LARGE'
          ));
        }
        return next(createError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) return next(err);
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    try {
      // Validate that a file was uploaded
      if (!file) {
        throw createError('No product image provided. Please upload a PNG, JPEG, or WebP file.', 400, 'NO_IMAGE');
      }

      // Parse and validate request body
      const parseResult = generateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        cleanupFile(file.path);
        const issues = parseResult.error.issues
          .map((i) => i.message)
          .join('; ');
        throw createError(`Validation failed: ${issues}`, 400, 'VALIDATION_ERROR');
      }

      const params = parseResult.data;

      // Call Stability AI
      const result = await generateImage(file.path, params);

      // Clean up temp file after successful generation
      cleanupFile(file.path);

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
    } catch (err) {
      // Ensure temp file is cleaned up on error too
      if (file?.path) cleanupFile(file.path);

      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => i.message).join('; ');
        return next(createError(`Validation error: ${issues}`, 400, 'VALIDATION_ERROR'));
      }

      next(err);
    }
  }
);
