/**
 * Predictive Guidance Engine (V3)
 * Determines the next best action based on session intelligence + journey progress.
 * Sits on top of existing intent detection and journey depth classification.
 */

import type { JourneyProgress, ConfidenceLevel } from '@/hooks/useJourneyProgress';
import type { Intent } from '@/lib/analytics/selenaSession';

export type PredictedAction =
  | 'compare_areas'
  | 'refine_plan'
  | 'run_tool'
  | 'book_call'
  | 'ask_selena'
  | 'explore_guides'
  | 'check_readiness'
  | 'view_cash_options';

export interface PredictionResult {
  action: PredictedAction;
  headlineEn: string;
  headlineEs: string;
  subtextEn: string;
  subtextEs: string;
  primaryCta: { labelEn: string; labelEs: string; destination: string };
  secondaryCta: { labelEn: string; labelEs: string; destination: string };
}

interface PredictiveContext {
  intent: Intent | undefined;
  confidenceLevel: ConfidenceLevel;
  journeyDepth: JourneyProgress['journeyDepth'];
  pagesViewed: number;
  guidesViewed: number;
  toolsUsed: number;
  neighborhoodExplored: boolean;
  hasReadinessScore: boolean;
  hasCalculatorResults: boolean;
  hasSellerDecision: boolean;
  hasBooked: boolean;
  scrollDepth: number; // 0-100
  timeOnSite: number; // seconds
}

export function buildPredictiveContext(progress: JourneyProgress): PredictiveContext {
  // Read scroll/time from session context (set by useSessionEnrichment)
  let scrollDepth = 0;
  let timeOnSite = 0;
  let pagesViewed = 0;
  try {
    const raw = localStorage.getItem('selena_context_v2');
    if (raw) {
      const ctx = JSON.parse(raw);
      scrollDepth = ctx.scroll_depth ?? 0;
      timeOnSite = ctx.time_on_site ?? 0;
      pagesViewed = ctx.pages_viewed ?? 0;
    }
  } catch { /* graceful */ }

  return {
    intent: progress.intent,
    confidenceLevel: progress.confidenceLevel,
    journeyDepth: progress.journeyDepth,
    pagesViewed,
    guidesViewed: progress.guideCount,
    toolsUsed: progress.toolCount,
    neighborhoodExplored: progress.hasExploredNeighborhood,
    hasReadinessScore: progress.hasReadinessScore,
    hasCalculatorResults: progress.hasCalculatorResults,
    hasSellerDecision: progress.hasSellerDecision,
    hasBooked: progress.hasBooked,
    scrollDepth,
    timeOnSite,
  };
}

export function predictNextBestAction(ctx: PredictiveContext): PredictionResult {
  // Rule 1: High confidence + evaluating → book
  if (ctx.confidenceLevel === 'high' && (ctx.journeyDepth === 'engaged' || ctx.journeyDepth === 'ready')) {
    return {
      action: 'book_call',
      headlineEn: "You've done the hard part. Let's turn this into a plan.",
      headlineEs: 'Ya hiciste lo más difícil. Convirtamos esto en un plan.',
      subtextEn: 'A short strategy session with Kasandra can save you weeks of second-guessing.',
      subtextEs: 'Una sesión de estrategia con Kasandra puede ahorrarte semanas de indecisión.',
      primaryCta: { labelEn: 'Plan your next step with Kasandra', labelEs: 'Planifica tu próximo paso con Kasandra', destination: '/book' },
      secondaryCta: { labelEn: 'Let Selena guide you through this', labelEs: 'Deja que Selena te guíe', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 2: Viewed neighborhoods but no tools used → compare
  if (ctx.neighborhoodExplored && ctx.toolsUsed === 0) {
    return {
      action: 'compare_areas',
      headlineEn: 'Based on what you\'ve explored so far, narrowing your options will bring the most clarity.',
      headlineEs: 'Según lo que has explorado, reducir tus opciones te dará más claridad.',
      subtextEn: 'Seeing areas side by side reveals what actually matters most to you.',
      subtextEs: 'Ver áreas lado a lado revela lo que realmente más te importa.',
      primaryCta: { labelEn: 'See how this compares to other areas', labelEs: 'Mira cómo se compara con otras áreas', destination: '/neighborhood-compare' },
      secondaryCta: { labelEn: 'Get guided help from Selena', labelEs: 'Recibe orientación de Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 3: Tool used + medium confidence → refine
  if (ctx.toolsUsed >= 1 && ctx.confidenceLevel === 'medium') {
    return {
      action: 'refine_plan',
      headlineEn: "You've started building clarity — let's sharpen the picture.",
      headlineEs: 'Estás ganando claridad — afinemos el panorama.',
      subtextEn: 'You\'re not expected to figure this out all at once. A small refinement here can make a big difference.',
      subtextEs: 'No tienes que resolverlo todo de una vez. Un pequeño ajuste aquí puede hacer una gran diferencia.',
      primaryCta: getRefinePrimaryCta(ctx),
      secondaryCta: { labelEn: 'Let Selena guide you through this', labelEs: 'Deja que Selena te guíe', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 4: Guides read but no tools → run tool
  if (ctx.guidesViewed >= 3 && ctx.toolsUsed === 0) {
    return {
      action: 'run_tool',
      headlineEn: "You've been doing great research. Now let's see what actually fits your numbers.",
      headlineEs: 'Has investigado muy bien. Ahora veamos qué encaja realmente con tus números.',
      subtextEn: 'This is where most people start to feel clarity — when the numbers become real.',
      subtextEs: 'Aquí es donde la mayoría empieza a sentir claridad — cuando los números se vuelven reales.',
      primaryCta: getToolCta(ctx),
      secondaryCta: { labelEn: 'Get guided help from Selena', labelEs: 'Recibe orientación de Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 5: High scroll + no interaction → gentle nudge
  if (ctx.scrollDepth >= 60 && ctx.toolsUsed === 0 && ctx.guidesViewed === 0) {
    return {
      action: 'ask_selena',
      headlineEn: 'Looking for something specific? Selena can point you in the right direction.',
      headlineEs: '¿Buscas algo específico? Selena puede orientarte.',
      subtextEn: "There's no pressure — she'll guide you based on what you're exploring.",
      subtextEs: 'Sin presión — te guiará según lo que estés explorando.',
      primaryCta: { labelEn: 'Let Selena guide you', labelEs: 'Deja que Selena te guíe', destination: 'selena:predictive_guidance' },
      secondaryCta: { labelEn: 'Explore our guides', labelEs: 'Explora nuestras guías', destination: '/guides' },
    };
  }

  // Rule 6: Some guides but few → explore more
  if (ctx.guidesViewed >= 1 && ctx.guidesViewed < 3) {
    return {
      action: 'explore_guides',
      headlineEn: "You're building a strong foundation — here's what to explore next.",
      headlineEs: 'Estás construyendo una base sólida — esto es lo que explorar a continuación.',
      subtextEn: 'People who explore a few more perspectives tend to feel more confident in their decisions.',
      subtextEs: 'Quienes exploran algunas perspectivas más suelen sentirse más seguros en sus decisiones.',
      primaryCta: { labelEn: 'Continue building your knowledge', labelEs: 'Continúa construyendo tu conocimiento', destination: '/guides' },
      secondaryCta: { labelEn: 'Get guided help from Selena', labelEs: 'Recibe orientación de Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Default: ask selena
  return {
    action: 'ask_selena',
    headlineEn: 'Not sure where to start? Selena can walk you through it.',
    headlineEs: '¿No sabes por dónde empezar? Selena puede acompañarte.',
    subtextEn: "Tell her what you're thinking — she'll help you move forward with clarity.",
    subtextEs: 'Dile lo que estás pensando — te ayudará a avanzar con claridad.',
    primaryCta: { labelEn: 'Let Selena guide you', labelEs: 'Deja que Selena te guíe', destination: 'selena:predictive_guidance' },
    secondaryCta: { labelEn: 'Explore areas on your own', labelEs: 'Explora áreas por tu cuenta', destination: '/neighborhoods' },
  };
}

function getRefinePrimaryCta(ctx: PredictiveContext) {
  if (ctx.intent === 'sell' && !ctx.hasSellerDecision) {
    return { labelEn: 'Understand your selling options', labelEs: 'Comprende tus opciones de venta', destination: '/seller-decision' };
  }
  if (ctx.intent === 'buy' && !ctx.hasReadinessScore) {
    return { labelEn: 'See where you stand as a buyer', labelEs: 'Mira dónde estás como comprador', destination: '/buyer-readiness' };
  }
  if (!ctx.hasCalculatorResults) {
    return { labelEn: 'See what actually fits your numbers', labelEs: 'Mira qué encaja con tus números', destination: '/cash-offer-options' };
  }
  return { labelEn: 'See how this compares to other areas', labelEs: 'Mira cómo se compara con otras áreas', destination: '/neighborhood-compare' };
}

function getToolCta(ctx: PredictiveContext) {
  if (ctx.intent === 'buy') {
    return { labelEn: 'See what actually fits your numbers', labelEs: 'Mira qué encaja con tus números', destination: '/affordability-calculator' };
  }
  if (ctx.intent === 'sell') {
    return { labelEn: 'Understand what you\'d walk away with', labelEs: 'Comprende con cuánto te quedarías', destination: '/net-to-seller' };
  }
  return { labelEn: 'See where you stand', labelEs: 'Mira dónde estás', destination: '/buyer-readiness' };
}
