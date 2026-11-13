import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { GEMINI_IMAGE_MODEL, PROJECT_ROOT, getGenAIClient } from '../config/genai.js';
import type { GarmentRecommendationInput } from '../types/garment.js';
import { buildGarmentPhotoPrompt } from './garmentPhotoPrompt.js';

const CACHE_DIR = path.join(PROJECT_ROOT, 'cache', 'garment-photos');
const PROMPT_VERSION = 'v1-studio-f5f5f5';
export const DEFAULT_GARMENT_ASPECT_RATIO = '3:4' as const;

export interface GeneratedGarmentImage {
  cacheKey: string;
  fileName: string;
  filePath: string;
  imageUrl: string;
  mimeType: string;
  aspectRatio: string;
  model: string;
  prompt: string;
  cached: boolean;
  latencyMs: number;
  bytes: number;
}

interface CacheMetadata {
  cacheKey: string;
  fileName: string;
  mimeType: string;
  aspectRatio: string;
  model: string;
  prompt: string;
  createdAt: string;
  bytes: number;
}

const inFlight = new Map<string, Promise<GeneratedGarmentImage>>();

export function getGarmentCacheDirectory(): string {
  return CACHE_DIR;
}

export function computeGarmentCacheKey(
  item: GarmentRecommendationInput,
  aspectRatio: string = DEFAULT_GARMENT_ASPECT_RATIO,
  model: string = GEMINI_IMAGE_MODEL
): string {
  const canonical = JSON.stringify({
    v: PROMPT_VERSION,
    model,
    aspectRatio,
    name: (item.name || '').trim().toLowerCase(),
    category: (item.category || '').trim().toLowerCase(),
    subType: (item.subType || '').trim().toLowerCase(),
    length: (item.length || '').trim().toLowerCase(),
    formality: (item.formality || '').trim().toLowerCase(),
    color: (item.color || '').trim().toLowerCase(),
    colorName: (item.colorName || '').trim().toLowerCase(),
    styleGender: item.styleGender || 'male',
  });
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 24);
}

function extensionFromMimeType(mimeType: string): 'png' | 'jpg' | 'webp' {
  const lower = mimeType.toLowerCase();
  if (lower.includes('png')) return 'png';
  if (lower.includes('webp')) return 'webp';
  return 'jpg';
}

async function readCachedImage(cacheKey: string): Promise<GeneratedGarmentImage | null> {
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);
  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(raw) as CacheMetadata;
    const filePath = path.join(CACHE_DIR, meta.fileName);
    await fs.access(filePath);
    return {
      cacheKey: meta.cacheKey,
      fileName: meta.fileName,
      filePath,
      imageUrl: `/api/garment-photos/${meta.fileName}`,
      mimeType: meta.mimeType,
      aspectRatio: meta.aspectRatio,
      model: meta.model,
      prompt: meta.prompt,
      cached: true,
      latencyMs: 0,
      bytes: meta.bytes,
    };
  } catch {
    return null;
  }
}

/**
 * Generates (or returns cached) e-commerce studio product photo for a suggested wardrobe piece.
 * Never regenerates existing cached items across reloads.
 */
export async function generateGarmentStudioImage(
  item: GarmentRecommendationInput,
  options: { aspectRatio?: '3:4' | '1:1'; forceRegenerate?: boolean } = {}
): Promise<GeneratedGarmentImage> {
  const aspectRatio = options.aspectRatio || DEFAULT_GARMENT_ASPECT_RATIO;
  const model = GEMINI_IMAGE_MODEL;
  const cacheKey = computeGarmentCacheKey(item, aspectRatio, model);

  if (!options.forceRegenerate) {
    const cached = await readCachedImage(cacheKey);
    if (cached) return cached;
  }

  const inflightKey = `${cacheKey}:${options.forceRegenerate ? 'force' : 'cache'}`;
  const pending = inFlight.get(inflightKey);
  if (pending) return pending;

  const task = (async (): Promise<GeneratedGarmentImage> => {
    const started = performance.now();
    const prompt = buildGarmentPhotoPrompt(item);
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio,
          imageSize: '1K',
        },
      },
    });

    let imageBase64 = '';
    let mimeType = 'image/png';

    for (const candidate of response.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
      if (imageBase64) break;
    }

    if (!imageBase64) {
      throw new Error(`Model ${model} returned no inline image data for "${item.name}".`);
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const ext = extensionFromMimeType(mimeType);
    const fileName = `${cacheKey}.${ext}`;
    const filePath = path.join(CACHE_DIR, fileName);

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const latencyMs = Math.round(performance.now() - started);
    const meta: CacheMetadata = {
      cacheKey,
      fileName,
      mimeType,
      aspectRatio,
      model,
      prompt,
      createdAt: new Date().toISOString(),
      bytes: buffer.byteLength,
    };
    await fs.writeFile(path.join(CACHE_DIR, `${cacheKey}.json`), JSON.stringify(meta, null, 2), 'utf8');

    return {
      cacheKey,
      fileName,
      filePath,
      imageUrl: `/api/garment-photos/${fileName}`,
      mimeType,
      aspectRatio,
      model,
      prompt,
      cached: false,
      latencyMs,
      bytes: buffer.byteLength,
    };
  })();

  inFlight.set(inflightKey, task);
  try {
    return await task;
  } finally {
    inFlight.delete(inflightKey);
  }
}
