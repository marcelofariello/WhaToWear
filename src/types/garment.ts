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

export const GARMENT_LENGTHS = [
  'short',
  'long',
  'sleeveless',
  'shorts',
  'cropped',
  'none',
] as const;

export const GARMENT_FORMALITIES = [
  'casual',
  'smart-casual',
  'elevated-casual',
  'athleisure',
  'lounge',
  'business-casual',
  'formal',
  'cocktail',
  'black-tie',
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];
export type GarmentSeason = (typeof GARMENT_SEASONS)[number];
export type GarmentLength = (typeof GARMENT_LENGTHS)[number];
export type GarmentFormality = (typeof GARMENT_FORMALITIES)[number];

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
  garment_type: z.string().min(1),
  subcategory: z.string().min(1).optional(),
  length: z.string().min(1),
  color_name: z.string().min(1),
  primaryColor: z.string().min(1).optional(),
  color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/i),
  season: z.enum(GARMENT_SEASONS),
  formality: z.string().min(1),
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
      description: 'Top-level wardrobe category for the garment: tops, bottoms, shoes, outerwear, or accessories.',
    },
    garment_type: {
      type: 'string',
      description:
        'Standard clean garment type mapped strictly to the closest match in the taxonomy without marketing fluff or fabric adjectives (e.g. T-Shirt, Polo Shirt, Dress Shirt, Sweater, Hoodie, Cardigan, Jeans, Chinos, Shorts, Chino Shorts, Sneakers, Loafers, Boots, Blazer, Trench Coat, Overcoat, Belt).',
    },
    subcategory: {
      type: 'string',
      description: 'Mirror alias of garment_type (identical value).',
    },
    length: {
      type: 'string',
      enum: [...GARMENT_LENGTHS],
      description:
        'Garment sleeve or pant length. For tops: "short" (short sleeve), "long" (long sleeve), or "sleeveless". For bottoms: "shorts", "cropped", or "long" (full-length trousers/jeans/chinos). For footwear/accessories/outerwear without length choice, use "long" or "none".',
    },
    color_name: {
      type: 'string',
      description:
        'Clean fashion color name for the primary garment (ignoring background, surface, or skin), e.g. Wine Red, Slate Gray, Navy, Black, Crisp White, Olive, Burgundy, Heather Gray.',
    },
    primaryColor: {
      type: 'string',
      description: 'Mirror alias of color_name (identical value).',
    },
    color_hex: {
      type: 'string',
      description:
        'Dominant 6-digit hex color code with leading hash for the garment, e.g. #722F37, #708090, #1E293B, #000080, #FFFFFF.',
    },
    season: {
      type: 'string',
      enum: [...GARMENT_SEASONS],
      description:
        'Appropriate seasonal wear window. Lightweight/breathable short sleeves/shorts: spring-summer or summer. Heavy knits/sweaters/coats/boots: autumn-winter or winter. Year-round denim/chinos: all-season.',
    },
    formality: {
      type: 'string',
      enum: [...GARMENT_FORMALITIES],
      description:
        'Appropriate formality level. T-shirts, regular jeans, casual shorts, casual sneakers: casual. Polos, overshirts, casual jackets: elevated-casual. Sweaters, button-downs, chinos, loafers, blazers: smart-casual. Dress shirts, dress pants: business-casual or formal. Activewear: athleisure.',
    },
    confidenceScore: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Model confidence score between 0.0 and 1.0.',
    },
  },
  required: [
    'category',
    'garment_type',
    'subcategory',
    'length',
    'color_name',
    'primaryColor',
    'color_hex',
    'season',
    'formality',
    'confidenceScore',
  ],
} as const;

export interface RecognizeGarmentRequest {
  imageBase64: string;
  mimeType: string;
  fileNameHint?: string;
  styleGender?: 'male' | 'female';
  availableSubTypes?: Record<string, string[]>;
}
