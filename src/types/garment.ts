import { z } from 'zod';

export const GARMENT_CATEGORIES = [
  'tops',
  'bottoms',
  'shoes',
  'outerwear',
  'accessories',
] as const;

export const GARMENT_SEASONS = [
  'all-season',
  'spring-summer',
  'autumn-winter',
  'spring',
  'summer',
  'autumn',
  'winter',
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];
export type GarmentSeason = (typeof GARMENT_SEASONS)[number];

export interface GarmentRecommendationInput {
  name: string;
  category: string;
  subType: string;
  length?: string;
  formality?: string;
  color?: string;
  colorName?: string;
  styleGender?: 'male' | 'female';
}

export const GarmentRecognitionResultSchema = z.object({
  category: z.enum(GARMENT_CATEGORIES),
  subcategory: z.string().min(1),
  primaryColor: z.string().min(1),
  season: z.enum(GARMENT_SEASONS),
  confidenceScore: z.number().min(0).max(1),
});

export type GarmentRecognitionResult = z.infer<typeof GarmentRecognitionResultSchema>;

/** Strict JSON Schema passed to Gemini Structured Outputs (`responseJsonSchema`). */
export const GARMENT_RECOGNITION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: {
      type: 'string',
      enum: [...GARMENT_CATEGORIES],
      description: 'Top-level wardrobe category for the garment in the image.',
    },
    subcategory: {
      type: 'string',
      description:
        'Specific garment type such as Crewneck T-Shirt, Long-Sleeve T-Shirt, Oxford Button-Down Shirt, Hoodie, Merino Wool Crewneck Sweater, Blazer, Trench Coat, Dark Indigo Jeans, Tailored Chinos, Chino Shorts, Minimalist White Leather Sneakers, Loafer, or Dress Leather Belt.',
    },
    primaryColor: {
      type: 'string',
      description:
        'Clean fashion color name for the primary garment only (ignoring background, hanger, or wearer skin), e.g., Crisp White, Midnight Navy, Olive, Indigo Denim, Cognac, Heather Gray, Jet Black.',
    },
    season: {
      type: 'string',
      enum: [...GARMENT_SEASONS],
      description: 'Most appropriate seasonal wear window based on fabric weight and construction.',
    },
    confidenceScore: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Model confidence score between 0.0 and 1.0.',
    },
  },
  required: ['category', 'subcategory', 'primaryColor', 'season', 'confidenceScore'],
} as const;

export interface RecognizeGarmentRequest {
  imageBase64: string;
  mimeType: string;
  fileNameHint?: string;
  styleGender?: 'male' | 'female';
  availableSubTypes?: Record<string, string[]>;
}
