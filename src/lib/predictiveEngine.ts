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
      headlineEn: "You're close to a decision — let's map out your next move.",
      headlineEs: 'Estás cerca de una decisión — planifiquemos tu próximo paso.',
      subtextEn: 'A short strategy call can save you weeks of uncertainty.',
      subtextEs: 'Una llamada estratégica breve puede ahorrarte semanas de incertidumbre.',
      primaryCta: { labelEn: 'Book Strategy Call', labelEs: 'Agendar Llamada Estratégica', destination: '/book' },
      secondaryCta: { labelEn: 'Ask Selena First', labelEs: 'Pregunta a Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 2: Viewed neighborhoods but no tools used → compare
  if (ctx.neighborhoodExplored && ctx.toolsUsed === 0) {
    return {
      action: 'compare_areas',
      headlineEn: 'Most people at this stage compare 2–3 areas before deciding.',
      headlineEs: 'La mayoría en esta etapa comparan 2–3 áreas antes de decidir.',
      subtextEn: 'Side-by-side comparison reveals what matters most to you.',
      subtextEs: 'La comparación lado a lado revela lo que más te importa.',
      primaryCta: { labelEn: 'Compare Areas', labelEs: 'Comparar Áreas', destination: '/neighborhood-compare' },
      secondaryCta: { labelEn: 'Ask Selena', labelEs: 'Pregunta a Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 3: Tool used + medium confidence → refine
  if (ctx.toolsUsed >= 1 && ctx.confidenceLevel === 'medium') {
    return {
      action: 'refine_plan',
      headlineEn: "You've started — now let's sharpen your plan.",
      headlineEs: 'Has empezado — ahora afinemos tu plan.',
      subtextEn: 'With the data you have, a quick refinement can clarify your path forward.',
      subtextEs: 'Con los datos que tienes, un ajuste rápido puede aclarar tu camino.',
      primaryCta: getRefinePrimaryCta(ctx),
      secondaryCta: { labelEn: 'Talk to Selena', labelEs: 'Habla con Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 4: Guides read but no tools → run tool
  if (ctx.guidesViewed >= 3 && ctx.toolsUsed === 0) {
    return {
      action: 'run_tool',
      headlineEn: "Based on what you've read, your next step is to clarify your numbers.",
      headlineEs: 'Según lo que has leído, tu próximo paso es aclarar tus números.',
      subtextEn: 'Knowledge is great — but clarity comes from running the numbers.',
      subtextEs: 'El conocimiento es genial — pero la claridad viene de analizar los números.',
      primaryCta: getToolCta(ctx),
      secondaryCta: { labelEn: 'Ask Selena', labelEs: 'Pregunta a Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Rule 5: High scroll + no interaction → gentle nudge
  if (ctx.scrollDepth >= 60 && ctx.toolsUsed === 0 && ctx.guidesViewed === 0) {
    return {
      action: 'ask_selena',
      headlineEn: 'Looking for something specific? Selena can help you find it.',
      headlineEs: '¿Buscas algo específico? Selena puede ayudarte a encontrarlo.',
      subtextEn: "She'll guide you based on what you're exploring.",
      subtextEs: 'Te guiará según lo que estés explorando.',
      primaryCta: { labelEn: 'Ask Selena', labelEs: 'Pregunta a Selena', destination: 'selena:predictive_guidance' },
      secondaryCta: { labelEn: 'Browse Guides', labelEs: 'Explorar Guías', destination: '/guides' },
    };
  }

  // Rule 6: Some guides but few → explore more
  if (ctx.guidesViewed >= 1 && ctx.guidesViewed < 3) {
    return {
      action: 'explore_guides',
      headlineEn: "You're building your knowledge — here's what to read next.",
      headlineEs: 'Estás construyendo tu conocimiento — esto es lo que leer a continuación.',
      subtextEn: 'People who read 3+ guides make more confident decisions.',
      subtextEs: 'Las personas que leen 3+ guías toman decisiones más seguras.',
      primaryCta: { labelEn: 'Continue Reading', labelEs: 'Continuar Leyendo', destination: '/guides' },
      secondaryCta: { labelEn: 'Ask Selena', labelEs: 'Pregunta a Selena', destination: 'selena:predictive_guidance' },
    };
  }

  // Default: ask selena
  return {
    action: 'ask_selena',
    headlineEn: 'Not sure where to start? Selena can guide you.',
    headlineEs: '¿No sabes por dónde empezar? Selena puede guiarte.',
    subtextEn: "Tell her what you're thinking — she'll point you in the right direction.",
    subtextEs: 'Dile lo que estás pensando — ella te indicará el camino correcto.',
    primaryCta: { labelEn: 'Talk to Selena', labelEs: 'Habla con Selena', destination: 'selena:predictive_guidance' },
    secondaryCta: { labelEn: 'Explore Areas', labelEs: 'Explorar Áreas', destination: '/neighborhoods' },
  };
}

function getRefinePrimaryCta(ctx: PredictiveContext) {
  if (ctx.intent === 'sell' && !ctx.hasSellerDecision) {
    return { labelEn: 'Start Seller Decision', labelEs: 'Iniciar Decisión de Venta', destination: '/seller-decision' };
  }
  if (ctx.intent === 'buy' && !ctx.hasReadinessScore) {
    return { labelEn: 'Check Buyer Readiness', labelEs: 'Verificar Preparación', destination: '/buyer-readiness' };
  }
  if (!ctx.hasCalculatorResults) {
    return { labelEn: 'Run the Numbers', labelEs: 'Analiza los Números', destination: '/cash-offer-options' };
  }
  return { labelEn: 'Compare Areas', labelEs: 'Comparar Áreas', destination: '/neighborhood-compare' };
}

function getToolCta(ctx: PredictiveContext) {
  if (ctx.intent === 'buy') {
    return { labelEn: 'Check Affordability', labelEs: 'Verificar Accesibilidad', destination: '/affordability-calculator' };
  }
  if (ctx.intent === 'sell') {
    return { labelEn: 'Estimate Your Net', labelEs: 'Estima Tu Neto', destination: '/net-to-seller' };
  }
  return { labelEn: 'Check Your Readiness', labelEs: 'Verifica Tu Preparación', destination: '/buyer-readiness' };
}
