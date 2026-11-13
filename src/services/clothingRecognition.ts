import { MediaResolution } from '@google/genai';
import { GEMINI_RECOGNITION_MODEL, getGenAIClient } from '../config/genai.js';
import {
  GARMENT_CATEGORIES,
  GARMENT_RECOGNITION_JSON_SCHEMA,
  GarmentRecognitionResultSchema,
  type GarmentRecognitionResult,
  type RecognizeGarmentRequest,
} from '../types/garment.js';

function stripBase64Prefix(raw: string): { base64: string; inferredMime?: string } {
  const match = raw.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { inferredMime: match[1], base64: match[2].replace(/\s+/g, '') };
  }
  return { base64: raw.replace(/\s+/g, '') };
}

function buildRecognitionPrompt(req: RecognizeGarmentRequest): string {
  const genderLabel = req.styleGender === 'female' ? 'feminine / women\'s' : 'masculine / men\'s';
  const taxonomyLines = req.availableSubTypes
    ? Object.entries(req.availableSubTypes)
        .filter(([cat]) => (GARMENT_CATEGORIES as readonly string[]).includes(cat))
        .map(([cat, subs]) => `- ${cat}: ${(subs || []).slice(0, 28).join(', ')}`)
        .join('\n')
    : '';

  return [
    `Analyze the primary clothing or fashion piece shown in this photo (${genderLabel} wardrobe context).`,
    'Inspect high-resolution details closely: collar construction, lapels, zippers or buttons, knit gauge, fabric weave, sleeve length, pant length, shoe silhouette, or accessory shape.',
    'If a person is wearing the garment, ignore skin tones and focus strictly on the primary garment itself (or matched pair for footwear).',
    req.fileNameHint ? `Original filename hint (use only if helpful, trust visual evidence first): "${req.fileNameHint}".` : '',
    taxonomyLines
      ? `Prefer a matching \`subcategory\` name from this catalog when accurate:\n${taxonomyLines}`
      : '',
    'Return ONLY valid JSON conforming strictly to the provided schema with keys: category, subcategory, primaryColor, season, confidenceScore.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Classifies an uploaded garment photo via Gemini 3.8 Flash using Structured Outputs and high media resolution.
 */
export async function identifyGarmentFromImage(
  req: RecognizeGarmentRequest
): Promise<GarmentRecognitionResult> {
  const { base64, inferredMime } = stripBase64Prefix(req.imageBase64);
  const mimeType = req.mimeType || inferredMime || 'image/jpeg';

  if (!base64 || base64.length < 32) {
    throw new Error('Invalid or empty garment image payload.');
  }

  const ai = getGenAIClient();
  const prompt = buildRecognitionPrompt(req);

  const response = await ai.models.generateContent({
    model: GEMINI_RECOGNITION_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    config: {
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseJsonSchema: GARMENT_RECOGNITION_JSON_SCHEMA,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error(`Model ${GEMINI_RECOGNITION_MODEL} returned an empty classification response.`);
  }

  const parsed = JSON.parse(text) as unknown;
  return GarmentRecognitionResultSchema.parse(parsed);
}
