import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

function resolveProjectRoot(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '../../..'),
    process.cwd(),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }
  }
  return process.cwd();
}

export const PROJECT_ROOT = resolveProjectRoot();
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

export const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3.1-flash-image';

export const GEMINI_RECOGNITION_MODEL =
  process.env.GEMINI_RECOGNITION_MODEL?.trim() || 'gemini-3.8-flash';

export const SERVER_PORT = Number.parseInt(process.env.PORT || '3000', 10) || 3000;

let cachedClient: GoogleGenAI | null = null;

/** Check whether a real server-side GEMINI_API_KEY is configured in `.env`. */
export function hasConfiguredGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim() || '';
  return key.length > 0 && key !== 'your_gemini_api_key_here';
}

/** Return a lazy singleton Google GenAI client initialized strictly from `process.env.GEMINI_API_KEY`. */
export function getGenAIClient(): GoogleGenAI {
  if (!hasConfiguredGeminiKey()) {
    throw new Error(
      'GEMINI_API_KEY is missing or unset. Copy .env.example to .env and set a valid server-side GEMINI_API_KEY.'
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
  }
  return cachedClient;
}
