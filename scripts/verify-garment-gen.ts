import fs from 'node:fs/promises';
import { hasConfiguredGeminiKey } from '../src/config/genai.js';
import { generateGarmentStudioImage } from '../src/services/garmentImageService.js';
import { buildGarmentPhotoPrompt } from '../src/services/garmentPhotoPrompt.js';
import type { GarmentRecommendationInput } from '../src/types/garment.js';

function readPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function readJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    const blockLen = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + blockLen;
  }
  return null;
}

function getImageDimensions(buf: Buffer, mimeType: string): { width: number; height: number } | null {
  return mimeType.includes('png') ? readPngDimensions(buf) : readJpegDimensions(buf);
}

async function main(): Promise<void> {
  const samples: GarmentRecommendationInput[] = [
    {
      name: 'Sharp Peak-Lapel Wool Blazer',
      category: 'outerwear',
      subType: 'Blazer',
      length: 'long',
      formality: 'smart-casual',
      color: '#172554',
      colorName: 'Midnight Navy',
      styleGender: 'male',
    },
    {
      name: 'Tailored Italian Linen-Cotton Camp Shirt',
      category: 'tops',
      subType: 'Dress Shirt',
      length: 'short',
      formality: 'smart-casual',
      color: '#f5f0e1',
      colorName: 'Ivory',
      styleGender: 'male',
    },
  ];

  console.log('=== Prompt Consistency Preview ===');
  for (const item of samples) {
    console.log(`\n[${item.name}]\n${buildGarmentPhotoPrompt(item)}\n`);
  }

  if (!hasConfiguredGeminiKey()) {
    console.error(
      'SKIPPED LIVE GENERATION: GEMINI_API_KEY is not set in .env. Set a valid key in .env to run the live 2-image studio generation test.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('=== Generating 2 Studio Garment Sample Photos (aspectRatio = 3:4) ===');
  for (const item of samples) {
    const first = await generateGarmentStudioImage(item, { aspectRatio: '3:4', forceRegenerate: true });
    const bytes = await fs.readFile(first.filePath);
    const dims = getImageDimensions(bytes, first.mimeType);
    const ratio = dims ? Number((dims.width / dims.height).toFixed(3)) : null;

    const second = await generateGarmentStudioImage(item, { aspectRatio: '3:4' });
    console.log(
      JSON.stringify(
        {
          item: item.name,
          model: first.model,
          filePath: first.filePath,
          bytes: first.bytes,
          dimensions: dims,
          measuredRatio: ratio,
          expectedRatio3to4: 0.75,
          coldLatencyMs: first.latencyMs,
          cacheHitSecondCall: second.cached,
          warmLatencyMs: second.latencyMs,
        },
        null,
        2
      )
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
