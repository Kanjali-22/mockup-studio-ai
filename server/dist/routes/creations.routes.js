"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creationsRoutes = void 0;
const express_1 = require("express");
exports.creationsRoutes = (0, express_1.Router)();
// Creations are stored client-side in IndexedDB.
// These endpoints are stubs for future server-side persistence.
exports.creationsRoutes.get('/creations', (_req, res) => {
    res.json({
        success: true,
        data: {
            creations: [],
            note: 'Creations are currently stored in your browser\'s local storage. Cloud storage is a future feature.',
        },
    });
});
exports.creationsRoutes.get('/creations/:id', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Creation ${req.params.id} not found. Creations are stored locally in your browser.`,
        },
    });
});
exports.creationsRoutes.delete('/creations/:id', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Server-side deletion is not available. Creations are managed locally in your browser.',
        },
    });
});
//# sourceMappingURL=creations.routes.js.map