/**
 * Guide Media Slots - Per-guide media placement configuration
 * 
 * Each guide gets up to 3 slots: orientation, trust, clarity.
 * Slots with no `src` or `quote` render NOTHING (zero UI).
 * 
 * Rule: Max 1 human element per guide (video OR pull-quote-image, not both).
 * 
 * Governance:
 *   Tier 1: orientation (required) + clarity (conditional) + trust
 *   Tier 2: orientation only (max 1 image)
 *   Tier 3: NO images — text only. Slots exist for structure but have no src.
 */
import { GUIDE_REGISTRY } from './guideRegistry';

export type MediaSlotVariant = 'orientation' | 'trust' | 'clarity';

export interface MediaSlot {
  id: string;
  variant: MediaSlotVariant;
  afterSection: number;
  type: 'image' | 'video' | 'pull-quote-image' | 'checklist-image';
  purpose: string;
  alt: string;
  altEs: string;
  src?: string;
  posterSrc?: string;
  quote?: string;
  quoteEs?: string;
}

export function validateMediaSlots(slots: MediaSlot[], guideId: string, tier?: number): void {
  if (import.meta.env.PROD) return;
  const humanSlots = slots.filter(
    (s) => (s.type === 'video' || s.type === 'pull-quote-image') && (s.src || s.quote)
  );
  if (humanSlots.length > 1) {
    console.warn(
      `[GuideMedia] Guide "${guideId}" has ${humanSlots.length} human elements. IDs: ${humanSlots.map((s) => s.id).join(', ')}`
    );
  }

  // Tier 1/2 guides require an orientation slot with a src
  if (tier !== undefined && (tier === 1 || tier === 2)) {
    const orientationSlot = slots.find((s) => s.variant === 'orientation');
    if (!orientationSlot || !orientationSlot.src) {
      console.warn(
        `[GuideMedia] Tier ${tier} guide "${guideId}" is missing required orientation image asset`
      );
    }
  }
}

/**
 * Enforce tier-based governance on media slots.
 * Tier 3 guides have all `src` fields stripped to enforce text-only rendering.
 * This prevents drift when new story guides are added.
 */
export function getGovernedMediaSlots(guideId: string): MediaSlot[] {
  const slots = GUIDE_MEDIA_SLOTS[guideId];
  if (!slots) return [];

  const registryEntry = GUIDE_REGISTRY.find(g => g.id === guideId);
  if (!registryEntry) return slots;

  // Tier 3: strip all src fields — text only
  if (registryEntry.tier === 3) {
    return slots.map(slot => {
      const { src, ...rest } = slot;
      return rest as MediaSlot;
    });
  }

  return slots;
}

// Storage base URL for guide assets
const STORAGE_BASE = `https://sghuhlmsrmqryfvcbqqj.supabase.co/storage/v1/object/public/guide-assets`;

export const GUIDE_MEDIA_SLOTS: Record<string, MediaSlot[]> = {
  // === TIER 1 GUIDES ===

  'first-time-buyer-guide': [
    {
      id: 'ftb-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Calm visual after intro to reduce cognitive load before financial section',
      alt: 'A welcoming Tucson home exterior',
      altEs: 'Exterior acogedor de una casa en Tucson',
      src: `${STORAGE_BASE}/guides/first-time-buyer-guide/hero.webp`,
    },
    {
      id: 'ftb-trust',
      variant: 'trust',
      afterSection: 3,
      type: 'pull-quote-image',
      purpose: 'Human voice at house-hunting stage where buyers feel most overwhelmed',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'The right home is the one that fits your life — not the one that looks best online.',
      quoteEs: 'La casa correcta es la que se ajusta a su vida — no la que se ve mejor en línea.',
    },
    {
      id: 'ftb-clarity',
      variant: 'clarity',
      afterSection: 5,
      type: 'checklist-image',
      purpose: 'Visual checklist for inspections/due-diligence — highest anxiety phase',
      alt: 'Home inspection checklist overview',
      altEs: 'Resumen de lista de inspección del hogar',
      src: `${STORAGE_BASE}/guides/first-time-buyer-guide/checklist.jpg`,
    },
  ],

  'selling-for-top-dollar': [
    {
      id: 'sell-orientation',
      variant: 'orientation',
      afterSection: 0,
      type: 'image',
      purpose: 'Warm image after emotional validation section to transition into process',
      alt: 'A Tucson home ready for sale',
      altEs: 'Una casa en Tucson lista para la venta',
      src: `${STORAGE_BASE}/guides/selling-for-top-dollar/hero.webp`,
    },
    {
      id: 'sell-trust',
      variant: 'trust',
      afterSection: 1,
      type: 'video',
      purpose: 'Kasandra explaining CMA process — densest section benefits from human face',
      alt: 'Kasandra explains the selling process',
      altEs: 'Kasandra explica el proceso de venta',
    },
    {
      id: 'sell-clarity',
      variant: 'clarity',
      afterSection: 3,
      type: 'image',
      purpose: 'Calm visual anchor after sell vs wait comparison',
      alt: 'A calm Tucson neighborhood',
      altEs: 'Un vecindario tranquilo de Tucson',
      src: `${STORAGE_BASE}/guides/selling-for-top-dollar/clarity.jpg`,
    },
  ],

  'cash-offer-guide': [
    {
      id: 'cash-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Calming image after emotional grounding intro',
      alt: 'A calm Tucson landscape',
      altEs: 'Un paisaje tranquilo de Tucson',
      src: `${STORAGE_BASE}/guides/cash-offer-guide/hero.webp`,
    },
    {
      id: 'cash-trust',
      variant: 'trust',
      afterSection: 2,
      type: 'video',
      purpose: 'Kasandra walking through 5-step cash offer process — builds confidence',
      alt: 'Kasandra explains cash offers',
      altEs: 'Kasandra explica las ofertas en efectivo',
    },
    {
      id: 'cash-clarity',
      variant: 'clarity',
      afterSection: 4,
      type: 'checklist-image',
      purpose: 'Cash vs Traditional side-by-side at the decision point',
      alt: 'Cash offer versus traditional sale comparison',
      altEs: 'Comparación de oferta en efectivo versus venta tradicional',
      src: `${STORAGE_BASE}/guides/cash-offer-guide/checklist.jpg`,
    },
  ],

  'inherited-probate-property': [
    {
      id: 'inh-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Calm Tucson neighborhood to ground emotional state after loss',
      alt: 'A quiet Tucson neighborhood at golden hour',
      altEs: 'Un vecindario tranquilo de Tucson al atardecer',
      src: `${STORAGE_BASE}/guides/inherited-probate-property/hero.webp`,
    },
    {
      id: 'inh-trust',
      variant: 'trust',
      afterSection: 2,
      type: 'pull-quote-image',
      purpose: 'Kasandra on navigating inherited property decisions with empathy',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'Inheriting a home comes with more than paperwork — it comes with memories, responsibility, and decisions that deserve time.',
      quoteEs: 'Heredar una casa viene con más que papeleo — viene con recuerdos, responsabilidad, y decisiones que merecen tiempo.',
    },
    {
      id: 'inh-clarity',
      variant: 'clarity',
      afterSection: 4,
      type: 'checklist-image',
      purpose: 'Options comparison: Keep vs Sell vs Transfer at the decision point',
      alt: 'Inherited property options comparison',
      altEs: 'Comparación de opciones para propiedad heredada',
      src: `${STORAGE_BASE}/guides/inherited-probate-property/checklist.jpg`,
    },
  ],

  // === TIER 2 GUIDES (orientation only — max 1 image per governance) ===

  'understanding-home-valuation': [
    {
      id: 'val-orientation',
      variant: 'orientation',
      afterSection: 0,
      type: 'image',
      purpose: 'Ground the reader visually after empathy-forward opening',
      alt: 'A Tucson neighborhood street view',
      altEs: 'Vista de una calle de vecindario en Tucson',
      src: `${STORAGE_BASE}/guides/understanding-home-valuation/hero.webp`,
    },
    {
      id: 'val-trust',
      variant: 'trust',
      afterSection: 2,
      type: 'pull-quote-image',
      purpose: 'Human voice on local knowledge vs online estimates',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'Online tools are convenient, but they cannot walk through your home or know your neighborhood the way a local professional can.',
      quoteEs: 'Las herramientas en línea son convenientes, pero no pueden recorrer su casa ni conocer su vecindario como lo hace un profesional local.',
    },
    // val-clarity REMOVED: Tier 2 governance = max 1 image
  ],

  'cash-vs-traditional-sale': [
    {
      id: 'cvt-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Ground the reader visually with contrasting home styles',
      alt: 'Two contrasting Tucson homes side by side',
      altEs: 'Dos casas contrastantes de Tucson lado a lado',
      src: `${STORAGE_BASE}/guides/cash-vs-traditional-sale/hero.webp`,
    },
    // Tier 2 governance = max 1 image
  ],

  'sell-now-or-wait': [
    {
      id: 'snw-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Symbolic fork-in-the-road to ground the timing decision',
      alt: 'A desert road at sunset with saguaro silhouettes',
      altEs: 'Un camino del desierto al atardecer con siluetas de saguaro',
      src: `${STORAGE_BASE}/guides/sell-now-or-wait/hero.webp`,
    },
    // Tier 2 governance = max 1 image
  ],

  'life-change-selling': [
    {
      id: 'lcs-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Calm residential street to ground emotional transition theme',
      alt: 'A quiet Tucson residential street at golden hour',
      altEs: 'Una calle residencial tranquila de Tucson al atardecer',
      src: `${STORAGE_BASE}/guides/life-change-selling/hero.webp`,
    },
    // Tier 2 governance = max 1 image
  ],

  // === TIER 3 STORIES (slots exist for structure, but src is stripped by getGovernedMediaSlots) ===

  'first-time-buyer-story': [
    {
      id: 'ftbs-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Warm image to set emotional tone for short story',
      alt: 'Keys on a table beside a front door',
      altEs: 'Llaves sobre una mesa junto a la puerta principal',
    },
    {
      id: 'ftbs-trust',
      variant: 'trust',
      afterSection: 1,
      type: 'pull-quote-image',
      purpose: 'Kasandra reflection on what made this engagement work',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'Every situation is different, but taking things one step at a time changes what feels possible.',
      quoteEs: 'Cada situación es diferente, pero ir paso a paso cambia lo que se siente posible.',
    },
    {
      id: 'ftbs-clarity',
      variant: 'clarity',
      afterSection: 2,
      type: 'image',
      purpose: 'Emotional resolution image before CTA',
      alt: 'A welcoming front door',
      altEs: 'Una puerta principal acogedora',
    },
  ],

  'budget-buyer-story': [
    {
      id: 'bbs-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Family-oriented image to set domestic tone',
      alt: 'A modest family home with a yard',
      altEs: 'Una casa familiar modesta con jardín',
    },
    {
      id: 'bbs-trust',
      variant: 'trust',
      afterSection: 1,
      type: 'pull-quote-image',
      purpose: 'Kasandra on strategic prioritization',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'Homeownership does not require stretching beyond your means — it requires being strategic about what matters most.',
      quoteEs: 'Ser propietario no requiere estirarse más allá de sus medios — requiere ser estratégico sobre lo que más importa.',
    },
    {
      id: 'bbs-clarity',
      variant: 'clarity',
      afterSection: 2,
      type: 'image',
      purpose: 'Right-sized home image reinforcing that modest is a win',
      alt: 'A well-kept modest home',
      altEs: 'Una casa modesta bien cuidada',
    },
  ],

  'seller-stressful-market-story': [
    {
      id: 'sms-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Transition image grounding the urgency theme',
      alt: 'Moving boxes and a timeline',
      altEs: 'Cajas de mudanza y un cronograma',
    },
    {
      id: 'sms-trust',
      variant: 'trust',
      afterSection: 1,
      type: 'pull-quote-image',
      purpose: 'Kasandra on communication during uncertainty',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'What makes the difference is not just the sale — it is staying informed throughout the process.',
      quoteEs: 'Lo que marca la diferencia no es solo la venta — es mantenerse informado durante todo el proceso.',
    },
    {
      id: 'sms-clarity',
      variant: 'clarity',
      afterSection: 2,
      type: 'image',
      purpose: 'Calm resolution image',
      alt: 'A sold sign on a home',
      altEs: 'Un letrero de vendido en una casa',
    },
  ],

  'spanish-speaking-client-story': [
    {
      id: 'ssc-orientation',
      variant: 'orientation',
      afterSection: -1,
      type: 'image',
      purpose: 'Community-oriented image for cultural grounding',
      alt: 'A South Tucson neighborhood',
      altEs: 'Un vecindario del sur de Tucson',
    },
    {
      id: 'ssc-trust',
      variant: 'trust',
      afterSection: 1,
      type: 'pull-quote-image',
      purpose: 'Kasandra on language and trust',
      alt: 'Kasandra Prieto',
      altEs: 'Kasandra Prieto',
      quote: 'Being understood — truly understood — changes what feels possible.',
      quoteEs: 'Ser comprendido — verdaderamente comprendido — cambia lo que se siente posible.',
    },
    {
      id: 'ssc-clarity',
      variant: 'clarity',
      afterSection: 2,
      type: 'image',
      purpose: 'Welcoming home in South Tucson for cultural grounding',
      alt: 'A welcoming home in South Tucson',
      altEs: 'Una casa acogedora en el sur de Tucson',
    },
  ],
};
