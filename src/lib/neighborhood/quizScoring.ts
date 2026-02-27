/**
 * Neighborhood Quiz Scoring Engine
 * Deterministic mapping of lifestyle answers → Tucson ZIP codes
 */

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionEs: string;
  options: QuizOption[];
}

export interface QuizOption {
  value: string;
  labelEn: string;
  labelEs: string;
  /** ZIP code → score contribution */
  scores: Record<string, number>;
}

export interface NeighborhoodMatch {
  zip: string;
  nameEn: string;
  nameEs: string;
  score: number;
  maxPossible: number;
  matchPercent: number;
  whyEn: string;
  whyEs: string;
}

/** Tucson neighborhood metadata keyed by ZIP */
const NEIGHBORHOODS: Record<string, { nameEn: string; nameEs: string; whyEn: string; whyEs: string }> = {
  "85719": {
    nameEn: "University / Downtown",
    nameEs: "Universidad / Centro",
    whyEn: "Walkable, vibrant, and close to culture, dining, and the U of A campus. Perfect for those who love urban energy.",
    whyEs: "Caminable, vibrante y cerca de la cultura, restaurantes y el campus de la U de A. Perfecto para quienes aman la energía urbana.",
  },
  "85705": {
    nameEn: "Central / Historic Districts",
    nameEs: "Centro / Distritos Históricos",
    whyEn: "Eclectic charm with mid-century homes, local shops, and a tight-knit community feel close to downtown.",
    whyEs: "Encanto ecléctico con casas de mediados de siglo, tiendas locales y una sensación de comunidad unida cerca del centro.",
  },
  "85710": {
    nameEn: "East Tucson",
    nameEs: "Este de Tucson",
    whyEn: "Family-friendly with good schools, parks, and solid home values. A great balance of comfort and affordability.",
    whyEs: "Ideal para familias con buenas escuelas, parques y valores de vivienda sólidos. Un gran balance entre comodidad y accesibilidad.",
  },
  "85704": {
    nameEn: "Northwest Tucson / Marana",
    nameEs: "Noroeste de Tucson / Marana",
    whyEn: "Growing suburban area with newer developments, family amenities, and easy freeway access.",
    whyEs: "Área suburbana en crecimiento con desarrollos nuevos, servicios familiares y fácil acceso a autopistas.",
  },
  "85718": {
    nameEn: "Catalina Foothills",
    nameEs: "Faldas de la Catalina",
    whyEn: "Stunning mountain views, luxury homes, and top-rated schools in one of Tucson's most prestigious neighborhoods.",
    whyEs: "Impresionantes vistas de montaña, casas de lujo y escuelas de primer nivel en uno de los vecindarios más prestigiosos de Tucson.",
  },
  "85745": {
    nameEn: "West Tucson / Gates Pass",
    nameEs: "Oeste de Tucson / Gates Pass",
    whyEn: "Nature-forward living with Saguaro National Park access, artistic community, and dramatic desert sunsets.",
    whyEs: "Vida en contacto con la naturaleza con acceso al Parque Nacional Saguaro, comunidad artística y atardeceres espectaculares.",
  },
  "85748": {
    nameEn: "Vail / Rita Ranch",
    nameEs: "Vail / Rita Ranch",
    whyEn: "Newer suburban homes with excellent schools, community parks, and a quieter pace of life southeast of the city.",
    whyEs: "Casas suburbanas más nuevas con excelentes escuelas, parques comunitarios y un ritmo de vida más tranquilo al sureste.",
  },
  "85737": {
    nameEn: "Oro Valley",
    nameEs: "Oro Valley",
    whyEn: "Upscale suburban living with hiking trails, top schools, and a strong sense of community north of Tucson.",
    whyEs: "Vida suburbana de alta gama con senderos, escuelas de primer nivel y fuerte sentido de comunidad al norte de Tucson.",
  },
  "85614": {
    nameEn: "Green Valley / Sahuarita",
    nameEs: "Green Valley / Sahuarita",
    whyEn: "Peaceful retirement-friendly community with golf courses, mild winters, and excellent value south of Tucson.",
    whyEs: "Comunidad pacífica ideal para jubilados con campos de golf, inviernos suaves y excelente valor al sur de Tucson.",
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "pace",
    questionEn: "What's your ideal pace of life?",
    questionEs: "¿Cuál es su ritmo de vida ideal?",
    options: [
      {
        value: "urban",
        labelEn: "Vibrant & walkable",
        labelEs: "Vibrante y caminable",
        scores: { "85719": 4, "85705": 3, "85710": 1, "85718": 1 },
      },
      {
        value: "suburban",
        labelEn: "Relaxed suburban with space",
        labelEs: "Suburbano relajado con espacio",
        scores: { "85710": 3, "85704": 4, "85748": 4, "85737": 3 },
      },
      {
        value: "nature",
        labelEn: "Quiet, nature-oriented",
        labelEs: "Tranquilo, orientado a la naturaleza",
        scores: { "85745": 4, "85614": 3, "85718": 2, "85737": 2 },
      },
      {
        value: "active",
        labelEn: "Active outdoor lifestyle",
        labelEs: "Estilo de vida activo al aire libre",
        scores: { "85718": 3, "85745": 4, "85737": 3, "85719": 1 },
      },
    ],
  },
  {
    id: "priorities",
    questionEn: "What matters most in a neighborhood?",
    questionEs: "¿Qué es lo más importante en un vecindario?",
    options: [
      {
        value: "schools",
        labelEn: "Great schools & family amenities",
        labelEs: "Buenas escuelas y servicios familiares",
        scores: { "85748": 4, "85737": 4, "85704": 3, "85710": 3 },
      },
      {
        value: "culture",
        labelEn: "Dining, culture & nightlife",
        labelEs: "Restaurantes, cultura y vida nocturna",
        scores: { "85719": 4, "85705": 3, "85718": 2 },
      },
      {
        value: "views",
        labelEn: "Mountain views & hiking access",
        labelEs: "Vistas de montaña y acceso a senderos",
        scores: { "85718": 4, "85745": 4, "85737": 3 },
      },
      {
        value: "value",
        labelEn: "Affordability & value",
        labelEs: "Accesibilidad y buen valor",
        scores: { "85710": 4, "85705": 3, "85614": 4, "85704": 3 },
      },
    ],
  },
  {
    id: "budget",
    questionEn: "What's your budget range?",
    questionEs: "¿Cuál es su rango de presupuesto?",
    options: [
      {
        value: "starter",
        labelEn: "Under $250K",
        labelEs: "Menos de $250K",
        scores: { "85710": 4, "85705": 3, "85614": 3, "85719": 2 },
      },
      {
        value: "mid",
        labelEn: "$250K – $400K",
        labelEs: "$250K – $400K",
        scores: { "85704": 4, "85748": 4, "85710": 3, "85705": 2 },
      },
      {
        value: "moveup",
        labelEn: "$400K – $600K",
        labelEs: "$400K – $600K",
        scores: { "85737": 4, "85718": 3, "85748": 2, "85704": 2 },
      },
      {
        value: "luxury",
        labelEn: "$600K+",
        labelEs: "$600K+",
        scores: { "85718": 4, "85737": 3, "85745": 2 },
      },
    ],
  },
  {
    id: "household",
    questionEn: "Who's moving in?",
    questionEs: "¿Quién se muda?",
    options: [
      {
        value: "solo",
        labelEn: "Just me / couple",
        labelEs: "Solo yo / pareja",
        scores: { "85719": 3, "85705": 3, "85745": 2, "85718": 2 },
      },
      {
        value: "family",
        labelEn: "Family with kids",
        labelEs: "Familia con niños",
        scores: { "85748": 4, "85704": 4, "85737": 3, "85710": 3 },
      },
      {
        value: "downsize",
        labelEn: "Downsizing / empty nesters",
        labelEs: "Reduciendo tamaño / nido vacío",
        scores: { "85614": 4, "85718": 2, "85705": 2, "85719": 2 },
      },
      {
        value: "relocating",
        labelEn: "Military / relocating",
        labelEs: "Militar / reubicación",
        scores: { "85710": 4, "85748": 3, "85704": 3, "85737": 2 },
      },
    ],
  },
  {
    id: "commute",
    questionEn: "What's your commute priority?",
    questionEs: "¿Cuál es su prioridad de transporte?",
    options: [
      {
        value: "walkbike",
        labelEn: "Walk or bike to everything",
        labelEs: "Caminar o ir en bici a todo",
        scores: { "85719": 4, "85705": 3 },
      },
      {
        value: "shortdrive",
        labelEn: "Short drive, easy access",
        labelEs: "Distancia corta en auto, fácil acceso",
        scores: { "85710": 3, "85704": 3, "85748": 2, "85737": 2 },
      },
      {
        value: "spacematters",
        labelEn: "I don't mind driving for space",
        labelEs: "No me importa manejar por espacio",
        scores: { "85748": 4, "85614": 3, "85745": 3, "85704": 2 },
      },
      {
        value: "remote",
        labelEn: "Work from home / retired",
        labelEs: "Trabajo desde casa / jubilado",
        scores: { "85614": 4, "85745": 3, "85718": 3, "85737": 2 },
      },
    ],
  },
];

/**
 * Compute the max possible score across all questions for normalizing percentages.
 * For each question, take the max score any single ZIP can get from that question.
 */
function computeMaxPossiblePerZip(): Record<string, number> {
  const maxPerZip: Record<string, number> = {};
  for (const q of QUIZ_QUESTIONS) {
    // For each ZIP, find the best score it can get from this question
    const bestPerZip: Record<string, number> = {};
    for (const opt of q.options) {
      for (const [zip, score] of Object.entries(opt.scores)) {
        bestPerZip[zip] = Math.max(bestPerZip[zip] || 0, score);
      }
    }
    for (const [zip, best] of Object.entries(bestPerZip)) {
      maxPerZip[zip] = (maxPerZip[zip] || 0) + best;
    }
  }
  return maxPerZip;
}

/**
 * Score answers and return top N neighborhood matches.
 */
export function scoreQuiz(
  answers: Record<string, string>,
  topN = 3
): NeighborhoodMatch[] {
  const zipScores: Record<string, number> = {};
  const maxPerZip = computeMaxPossiblePerZip();

  for (const q of QUIZ_QUESTIONS) {
    const selected = answers[q.id];
    if (!selected) continue;
    const option = q.options.find((o) => o.value === selected);
    if (!option) continue;
    for (const [zip, score] of Object.entries(option.scores)) {
      zipScores[zip] = (zipScores[zip] || 0) + score;
    }
  }

  const results: NeighborhoodMatch[] = Object.entries(zipScores)
    .map(([zip, score]) => {
      const meta = NEIGHBORHOODS[zip];
      if (!meta) return null;
      const maxPossible = maxPerZip[zip] || 1;
      return {
        zip,
        nameEn: meta.nameEn,
        nameEs: meta.nameEs,
        score,
        maxPossible,
        matchPercent: Math.round((score / maxPossible) * 100),
        whyEn: meta.whyEn,
        whyEs: meta.whyEs,
      };
    })
    .filter(Boolean) as NeighborhoodMatch[];

  results.sort((a, b) => b.matchPercent - a.matchPercent || b.score - a.score);
  return results.slice(0, topN);
}
