"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const stability_service_1 = require("../services/stability.service");
exports.healthRoutes = (0, express_1.Router)();
exports.healthRoutes.get('/health', (_req, res) => {
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
                    ? `sk-...${process.env.STABILITY_API_KEY.slice(-4)}`
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
exports.healthRoutes.get('/models', (_req, res) => {
    res.json({
        success: true,
        data: {
            models: (0, stability_service_1.getSupportedModels)(),
        },
    });
});
//# sourceMappingURL=health.routes.js.map