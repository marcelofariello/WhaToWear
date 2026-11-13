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
        .map(([cat, subs]) => `- ${cat}: ${(subs || []).join(', ')}`)
        .join('\n')
    : '';

  return [
    `Analyze the primary clothing or fashion piece shown in this photo (${genderLabel} wardrobe context).`,
    '### CRITICAL: FOLDED CLOTHING & FLAT-LAY RECOGNITION RULES:',
    '- Clothes are very frequently photographed laid flat, neatly folded, or stacked on a bed, table, rug, or floor.',
    '- DO NOT mistake horizontal fold creases or layered fabric folds for puffer jacket baffles, quilted down channels, or heavy outerwear padding! Puffer jackets have glossy or matte technical nylon/polyester shells, puffy down/synthetic loft, heavy zippers, storm flaps, and elastic drawcords. Soft jersey or knit cotton fabrics folded flat are T-SHIRTS, POLOS, HENLEYS, or SWEATERS, NEVER puffer jackets or parkas.',
    '- DO NOT mistake a folded top (such as a t-shirt or sweater folded into a square or rectangle) for shorts or trousers! Check for circular collar ribbing, neckline openings, crewneck/v-neck bands, sleeve hems, and fabric drape.',
    '- Inspect fine fabric construction closely: cotton jersey knit vs piqué weave vs wool knit vs denim twill vs dress poplin, collar construction, neckline ribs, sleeve cuffs, hem stitching, and folded proportions.',
    '- If you see a crewneck or v-neck collar with short sleeves folded inwards, classify strictly as category "tops", garment_type "T-Shirt", and length "short".',
    '- If you see denim twill with metal rivets and 5-pocket styling, classify as category "bottoms", garment_type "Jeans". If it has short legs above knee, classify as "Denim Shorts".',
    '- If you see sweater yarn with ribbed collar and cuffs, classify as category "tops", garment_type "Sweater".',
    '- Map the item STRICTLY to the closest valid option in the provided taxonomy list for the identified category. DO NOT invent free-text adjectives or brand marketing names (e.g., do not output "Merino Wool Crewneck Sweater" or "Tailored Chino Shorts" — use clean garment types like "Sweater", "T-Shirt", "Chinos", "Jeans", "Shorts").',
    req.fileNameHint ? `Original filename hint (use only if helpful, trust visual evidence first): "${req.fileNameHint}".` : '',
    taxonomyLines
      ? `Available category & garment_type taxonomy:\n${taxonomyLines}`
      : '',
    'Return a single unified JSON object conforming strictly to the provided schema with keys: category, garment_type, subcategory, length, color_name, primaryColor, color_hex, season, formality, confidenceScore.',
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

  const parsed = JSON.parse(text) as Record<string, unknown>;
  // Guarantee mirror aliases are synchronized
  if (!parsed.garment_type && parsed.subcategory) parsed.garment_type = parsed.subcategory;
  if (!parsed.subcategory && parsed.garment_type) parsed.subcategory = parsed.garment_type;
  if (!parsed.color_name && parsed.primaryColor) parsed.color_name = parsed.primaryColor;
  if (!parsed.primaryColor && parsed.color_name) parsed.primaryColor = parsed.color_name;

  return GarmentRecognitionResultSchema.parse(parsed);
}
