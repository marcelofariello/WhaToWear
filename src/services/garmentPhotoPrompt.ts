import type { GarmentRecommendationInput } from '../types/garment.js';

export const STUDIO_PROMPT_STYLE =
  'Clean e-commerce studio product photography, ghost mannequin or neat flat-lay presentation on a pure solid off-white/light-grey background (#F5F5F5).';

export const STUDIO_PROMPT_LIGHTING =
  'Soft diffused studio lighting from the front-left to highlight fabric grain without harsh shadows, sharp focus across the entire garment, centered composition with 15% padding.';

export const STUDIO_PROMPT_NEGATIVES =
  'Single isolated garment only, no human models, no text overlays, no watermarks, no hangers, no cluttered props.';

interface MaterialProfile {
  match: RegExp;
  weave: string;
  details: string;
  presentation: string;
}

const GARMENT_PROFILES: MaterialProfile[] = [
  {
    match: /\b(blazer|sport coat|suit jacket)\b/i,
    weave: 'brushed wool or breathable fine wool-linen twill with visible natural yarn texture',
    details: 'tailored structured shoulders, notched or peak lapels, two-button single-breasted closure, welt chest pocket, and flap hip pockets',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(trench)\b/i,
    weave: 'tightly woven water-repellent cotton gabardine twill with crisp drape',
    details: 'double-breasted horn buttons, structured storm lapel collar, waist tie belt with buckle, buttoned cuff tabs, and welt pockets',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(car coat|overcoat|wool coat|rain jacket)\b/i,
    weave: 'matte tightly woven technical cotton-blend gabardine or brushed wool coating fabric',
    details: 'clean architectural point collar, concealed buttoned front placket, slanted welt pockets, and smooth structured sleeves',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(cardigan)\b/i,
    weave: 'textured waffle-knit or fine ribbed combed cotton-cashmere yarn',
    details: 'soft V-neck opening, tonal tortoiseshell button-front closure, and neatly ribbed cuffs and waist hem',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(sweater|knit|merino|cashmere|pullover)\b/i,
    weave: 'fine-gauge brushed merino wool or cashmere knit showing subtle natural stitch grain',
    details: 'finely linked ribbed crewneck collar, fashioned shoulder seams, and clean ribbed cuffs and hem',
    presentation: 'invisible 3D ghost mannequin or crisp studio knit lay-down',
  },
  {
    match: /\b(hoodie|sweatshirt)\b/i,
    weave: 'textured heavyweight French terry fleece cotton',
    details: 'double-lined structured hood or ribbed crewneck, kangaroo pocket, and wide ribbed cuffs and waistband',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(blouse|silk|satin)\b/i,
    weave: 'lustrous fluid mulberry silk crepe de chine with natural matte-sheen drape',
    details: 'relaxed spread or fluid notched collar, concealed or mother-of-pearl button front placket, and softly tailored sleeves',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(camp|linen).*shirt|shirt|oxford|overshirt/i,
    weave: 'breathable Italian slub linen-cotton weave or crisp combed Oxford cloth',
    details: 'clean collar construction, tonal button front placket, single chest patch pocket, and neatly pressed hems',
    presentation: 'invisible 3D ghost mannequin silhouette',
  },
  {
    match: /\b(t-shirt|tee|henley)\b/i,
    weave: 'textured heavyweight combed organic cotton jersey',
    details: 'bound ribbed crew collar (or three-button henley placket) with tailored clean shoulder seam and straight hem',
    presentation: 'crisp invisible ghost mannequin silhouette',
  },
  {
    match: /\b(short)\b/i,
    weave: 'breathable washed linen-cotton twill weave with matte natural finish',
    details: 'tailored mid-rise waistband with belt loops, horn button and zip fly closure, side slash pockets, and clean straight hem',
    presentation: 'neat e-commerce flat-lay presentation',
  },
  {
    match: /\b(trouser|chino|pant|jean|denim|skirt)\b/i,
    weave: 'compact stretch-cotton cavalry twill or fine worsted drape wool (or selvedge denim twill when denim)',
    details: 'tailored waistband with belt loops, crisp front pleats or flat front, concealed hook-and-zip closure, and clean pressed leg drape',
    presentation: 'neat straight-on ghost mannequin or crisp flat-lay presentation',
  },
  {
    match: /\b(loafer|dress shoe|oxford|derby|boot)\b/i,
    weave: 'velvety matte suede or supple full-grain aniline calf leather with subtle natural grain',
    details: 'hand-stitched upper vamp seam, structured rounded almond toe box, leather welt stitching, and low stacked leather heel shown as a clean side-angled single-axis studio view',
    presentation: 'clean studio product presentation (a matched pair neatly angled)',
  },
  {
    match: /\b(sneaker|trainer)\b/i,
    weave: 'matte full-grain nappa leather with tonal double-stitched seams',
    details: 'low-top minimalist lace-up court silhouette, tonal flat cotton laces, cushioned leather collar, and clean rubber cupsole',
    presentation: 'clean studio product presentation (a matched pair neatly angled)',
  },
  {
    match: /\b(belt)\b/i,
    weave: 'matte full-grain vegetable-tanned bridle calfskin leather with subtle edge creasing',
    details: 'cleanly coiled leather strap with single-prong brushed metal buckle and stitched leather keeper loop',
    presentation: 'neat overhead e-commerce flat-lay presentation',
  },
];

function inferMaterialProfile(item: GarmentRecommendationInput): MaterialProfile {
  const probe = `${item.name} ${item.subType} ${item.category}`;
  const matched = GARMENT_PROFILES.find((p) => p.match.test(probe));
  if (matched) return matched;
  return {
    match: /.*/,
    weave: 'natural matte fine cotton-wool textile with clear surface grain',
    details: 'clean tailored seam work, balanced neckline/collar geometry, and refined minimal closures',
    presentation: 'invisible 3D ghost mannequin silhouette',
  };
}

function buildSleeveAndCutClause(item: GarmentRecommendationInput): string {
  const genderLabel = item.styleGender === 'female' ? "women's tailored" : "men's tailored";
  const lengthLabel =
    item.length === 'short'
      ? 'short-sleeve'
      : item.length === 'sleeveless'
      ? 'sleeveless'
      : item.length === 'shorts'
      ? 'above-knee tailored shorts length'
      : item.length === 'long'
      ? 'full-length'
      : '';
  const formalityLabel = item.formality ? item.formality.replace(/-/g, ' ').trim() : '';
  return [genderLabel, formalityLabel, lengthLabel].filter(Boolean).join(' ').trim();
}

/**
 * Dynamically builds a consistent, studio-grade e-commerce product prompt for Gemini image generation.
 */
export function buildGarmentPhotoPrompt(item: GarmentRecommendationInput): string {
  const profile = inferMaterialProfile(item);
  const colorLabel = item.colorName?.trim() || 'classic neutral';
  const cutClause = buildSleeveAndCutClause(item);

  const subjectLine = [
    `Subject: ${item.name} (${item.subType || item.category}), ${cutClause} cut.`,
    `Color & Material: true ${colorLabel} colorway rendered in ${profile.weave}.`,
    `Construction & Presentation: ${profile.presentation} featuring ${profile.details}.`,
  ].join(' ');

  return [
    `Style & Format: ${STUDIO_PROMPT_STYLE}`,
    subjectLine,
    `Lighting & Camera: ${STUDIO_PROMPT_LIGHTING}`,
    `Guardrails: ${STUDIO_PROMPT_NEGATIVES}`,
  ].join('\n');
}
