import { Router, Request, Response } from 'express';

export const creationsRoutes = Router();

// Creations are stored client-side in IndexedDB.
// These endpoints are stubs for future server-side persistence.

creationsRoutes.get('/creations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      creations: [],
      note: 'Creations are currently stored in your browser\'s local storage. Cloud storage is a future feature.',
    },
  });
});

creationsRoutes.get('/creations/:id', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Creation ${req.params.id} not found. Creations are stored locally in your browser.`,
    },
  });
});

creationsRoutes.delete('/creations/:id', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Server-side deletion is not available. Creations are managed locally in your browser.',
    },
  });
});
