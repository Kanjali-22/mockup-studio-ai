import { Router, Request, Response } from 'express';
import { getSupportedModels } from '../services/stability.service';

export const healthRoutes = Router();

healthRoutes.get('/health', (_req: Request, res: Response) => {
  const apiKeyConfigured = Boolean(process.env.STABILITY_API_KEY);

  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      api: {
        stabilityConfigured: apiKeyConfigured,
        // Never return the actual key
        stabilityKeyHint: apiKeyConfigured
          ? `sk-...${process.env.STABILITY_API_KEY!.slice(-4)}`
          : null,
      },
      limits: {
        maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      },
    },
  });
});

healthRoutes.get('/models', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      models: getSupportedModels(),
    },
  });
});
