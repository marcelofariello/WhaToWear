import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  GEMINI_IMAGE_MODEL,
  GEMINI_RECOGNITION_MODEL,
  PROJECT_ROOT,
  SERVER_PORT,
  hasConfiguredGeminiKey,
} from './config/genai.js';
import { identifyGarmentFromImage } from './services/clothingRecognition.js';
import {
  DEFAULT_GARMENT_ASPECT_RATIO,
  generateGarmentStudioImage,
  getGarmentCacheDirectory,
} from './services/garmentImageService.js';

const __filename = fileURLToPath(import.meta.url);

const RecommendationImageSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subType: z.string().min(1),
  length: z.string().optional(),
  formality: z.string().optional(),
  color: z.string().optional(),
  colorName: z.string().optional(),
  styleGender: z.enum(['male', 'female']).optional(),
  aspectRatio: z.enum(['3:4', '1:1']).optional(),
  forceRegenerate: z.boolean().optional(),
});

const RecognizeBodySchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
  fileNameHint: z.string().optional(),
  styleGender: z.enum(['male', 'female']).optional(),
  availableSubTypes: z.record(z.array(z.string())).optional(),
});

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: hasConfiguredGeminiKey(),
      imageModel: GEMINI_IMAGE_MODEL,
      recognitionModel: GEMINI_RECOGNITION_MODEL,
      aspectRatio: DEFAULT_GARMENT_ASPECT_RATIO,
    });
  });

  app.use(
    '/api/garment-photos',
    express.static(getGarmentCacheDirectory(), {
      maxAge: '365d',
      immutable: true,
    })
  );

  app.post('/api/recommendations/image', async (req, res) => {
    if (!hasConfiguredGeminiKey()) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server .env',
        code: 'GEMINI_KEY_MISSING',
      });
      return;
    }

    const parsed = RecommendationImageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid garment payload', details: parsed.error.flatten() });
      return;
    }

    try {
      const { aspectRatio, forceRegenerate, ...item } = parsed.data;
      const result = await generateGarmentStudioImage(item, { aspectRatio, forceRegenerate });
      res.json({
        cacheKey: result.cacheKey,
        imageUrl: result.imageUrl,
        mimeType: result.mimeType,
        aspectRatio: result.aspectRatio,
        model: result.model,
        cached: result.cached,
        latencyMs: result.latencyMs,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate garment studio photo';
      console.error('[garment-image-error]', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/recognize-garment', async (req, res) => {
    if (!hasConfiguredGeminiKey()) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server .env',
        code: 'GEMINI_KEY_MISSING',
      });
      return;
    }

    const parsed = RecognizeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid image recognition payload', details: parsed.error.flatten() });
      return;
    }

    try {
      const recognition = await identifyGarmentFromImage(parsed.data);
      res.json(recognition);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to recognize garment image';
      console.error('[clothing-recognition-error]', message);
      res.status(500).json({ error: message });
    }
  });

  // Serve only the single-file frontend and optional local sample photos (never expose .env, src/, or server files)
  app.use('/photos', express.static(path.join(PROJECT_ROOT, 'photos')));
  app.get(['/', '/index.html'], async (_req, res, next) => {
    try {
      const html = await fs.readFile(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
      res.type('html').send(html);
    } catch (err) {
      next(err);
    }
  });

  return app;
}

const isDirectEntry =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectEntry) {
  const app = createApp();
  app.listen(SERVER_PORT, () => {
    console.log(
      `WhaToWear server listening at http://localhost:${SERVER_PORT} (Gemini API key ${
        hasConfiguredGeminiKey() ? 'configured' : 'missing'
      })`
    );
  });
}
