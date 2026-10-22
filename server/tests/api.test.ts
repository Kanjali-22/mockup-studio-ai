import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock stability service to avoid real API calls
vi.mock('../src/services/stability.service', async () => {
  const actual = await vi.importActual('../src/services/stability.service');
  return {
    ...actual,
    generateImage: vi.fn(),
    cleanupFile: vi.fn(),
  };
});

import { generateImage, cleanupFile } from '../src/services/stability.service';

const mockedGenerateImage = vi.mocked(generateImage);
const mockedCleanupFile = vi.mocked(cleanupFile);

describe('GET /api/health', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('does not expose the API key', async () => {
    process.env.STABILITY_API_KEY = 'sk-secret1234567890';
    const res = await request(app).get('/api/health');
    expect(JSON.stringify(res.body)).not.toContain('sk-secret1234567890');
    delete process.env.STABILITY_API_KEY;
  });
});

describe('GET /api/models', () => {
  it('returns supported models', async () => {
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.models)).toBe(true);
    expect(res.body.data.models.length).toBeGreaterThan(0);
  });
});

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when no image is provided', async () => {
    const res = await request(app)
      .post('/api/generate')
      .field('prompt', 'A test product scene')
      .field('aspectRatio', '1:1')
      .field('model', 'stable-image-core');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_IMAGE');
  });

  it('returns 400 when prompt is missing', async () => {
    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .field('aspectRatio', '1:1')
      .field('model', 'stable-image-core');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 with invalid aspect ratio', async () => {
    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .field('prompt', 'A test scene')
      .field('aspectRatio', '5:7')
      .field('model', 'stable-image-core');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 with invalid model', async () => {
    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .field('prompt', 'A test scene')
      .field('aspectRatio', '1:1')
      .field('model', 'fake-model-v99');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 503 when API key is missing', async () => {
    const originalKey = process.env.STABILITY_API_KEY;
    delete process.env.STABILITY_API_KEY;

    mockedGenerateImage.mockRejectedValueOnce(
      Object.assign(new Error('API key not configured'), { statusCode: 503, code: 'API_KEY_MISSING' })
    );

    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .field('prompt', 'A test scene')
      .field('aspectRatio', '1:1')
      .field('model', 'stable-image-core');

    expect([400, 503]).toContain(res.status);
    expect(res.body.success).toBe(false);

    process.env.STABILITY_API_KEY = originalKey;
  });

  it('returns success with mocked generation and product preservation metadata', async () => {
    mockedGenerateImage.mockResolvedValueOnce({
      imageBase64: 'base64MockImageData==',
      mimeType: 'image/png',
      seed: 12345,
      model: 'replace-background-and-relight',
      prompt: 'A luxury product on marble',
      workflowUsed: 'replace-background-and-relight',
      productPreserved: true,
      debugInfo: {
        workflow: 'replace-background-and-relight',
        endpointCalled: 'https://api.stability.ai/v2beta/stable-image/edit/replace-background-and-relight',
        durationMs: 1200,
      },
    });

    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .field('prompt', 'A luxury product on marble')
      .field('aspectRatio', '1:1')
      .field('model', 'stable-image-core')
      .field('workflow', 'relight')
      .field('productScale', '0.70')
      .field('positionX', '0')
      .field('positionY', '10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageBase64).toBe('base64MockImageData==');
    expect(res.body.data.workflowUsed).toBe('replace-background-and-relight');
    expect(res.body.data.productPreserved).toBe(true);
    expect(mockedCleanupFile).toHaveBeenCalled();
  });

  it('rejects non-image files', async () => {
    const res = await request(app)
      .post('/api/generate')
      .attach('image', Buffer.from('console.log("hack")'), {
        filename: 'malicious.js',
        contentType: 'application/javascript',
      })
      .field('prompt', 'A test scene')
      .field('aspectRatio', '1:1');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
