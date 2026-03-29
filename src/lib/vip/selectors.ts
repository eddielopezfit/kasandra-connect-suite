/**
 * VIP Selectors — derived intelligence from the canonical profile.
 * Pure functions. No side effects.
 */

import type { VisitorIntelligenceProfile } from './types';

// ── Booking Readiness ─────────────────────────────────────

export type BookingReadiness = 'not_ready' | 'warming' | 'ready' | 'overdue';

/**
 * Determines how ready the visitor is for a booking CTA.
 * - not_ready: brand-new, no engagement
 * - warming: has intent or some tool usage
 * - ready: has readiness score, decision path, or 2+ tools done
 * - overdue: engaged user who hasn't booked (high friction signal)
 */
export function selectBookingReadiness(vip: VisitorIntelligenceProfile): BookingReadiness {
  const { journey, intent } = vip;

  if (journey.hasBooked) return 'ready'; // Already converted

  const hasDecisionSignal = !!(intent.readinessScore || intent.sellerDecisionPath);
  const highToolUsage = journey.toolsCompleted.length >= 2;

  if (hasDecisionSignal || highToolUsage) {
    // Overdue = ready signals + high guide count but no booking
    if (journey.guidesCompleted.length >= 5 && journey.toolsCompleted.length >= 2) {
      return 'overdue';
    }
    return 'ready';
  }

  if (intent.intent || journey.toolsCompleted.length >= 1 || journey.guidesCompleted.length >= 1) {
    return 'warming';
  }

  return 'not_ready';
}

// ── Friction Score ────────────────────────────────────────

/**
 * 0-100 score. Higher = more friction detected.
 * Signals: many pages/tools but no booking, high guide count with no lead capture,
 * returning user without contact info.
 */
export function selectFrictionScore(vip: VisitorIntelligenceProfile): number {
  let score = 0;

  // Engaged but no contact info
  if (vip.journey.journeyDepth !== 'new' && !vip.identity.email) {
    score += 25;
  }

  // High tool count but no booking
  if (vip.journey.toolsCompleted.length >= 2 && !vip.journey.hasBooked) {
    score += 20;
  }

  // Read 3+ guides but no tool usage
  if (vip.journey.guidesCompleted.length >= 3 && vip.journey.toolsCompleted.length === 0) {
    score += 15;
  }

  // Has readiness score but hasn't booked
  if (vip.intent.readinessScore && !vip.journey.hasBooked) {
    score += 20;
  }

  // Returning user without intent
  if (vip.identity.isReturning && !vip.intent.intent) {
    score += 10;
  }

  // Has viewed report but hasn't booked
  if (vip.journey.hasViewedReport && !vip.journey.hasBooked) {
    score += 10;
  }

  return Math.min(score, 100);
}

// ── Recommended Next Step ─────────────────────────────────

export interface RecommendedNextStep {
  type: 'tool' | 'guide' | 'chat' | 'book' | 'capture';
  labelEn: string;
  labelEs: string;
  destination: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Returns the single best next action for this visitor.
 * Priority: booking > tool gaps > guide suggestions > open chat.
 */
export function selectRecommendedNextStep(vip: VisitorIntelligenceProfile): RecommendedNextStep {
  const { intent, journey, identity } = vip;

  // If overdue for booking
  if (selectBookingReadiness(vip) === 'overdue') {
    return {
      type: 'book',
      labelEn: 'Schedule your strategy session',
      labelEs: 'Agenda tu sesión de estrategia',
      destination: '/book',
      priority: 'critical',
    };
  }

  // Ready for booking
  if (selectBookingReadiness(vip) === 'ready' && !journey.hasBooked) {
    return {
      type: 'book',
      labelEn: "Let's sit down and talk through this",
      labelEs: 'Sentémonos a platicar sobre esto',
      destination: '/book',
      priority: 'high',
    };
  }

  // No contact info yet — capture first
  if (journey.toolsCompleted.length >= 1 && !identity.email) {
    return {
      type: 'capture',
      labelEn: 'Save your results',
      labelEs: 'Guarda tus resultados',
      destination: 'lead_capture_modal',
      priority: 'high',
    };
  }

  // Intent-specific tool gaps
  if (intent.intent === 'buy' && !intent.readinessScore) {
    return {
      type: 'tool',
      labelEn: 'See where you stand as a buyer',
      labelEs: 'Mira dónde estás como comprador',
      destination: '/buyer-readiness',
      priority: 'medium',
    };
  }

  if (intent.intent === 'sell' && !intent.sellerDecisionPath) {
    return {
      type: 'tool',
      labelEn: 'Walk through your selling options',
      labelEs: 'Revisa tus opciones de venta',
      destination: '/seller-decision',
      priority: 'medium',
    };
  }

  if (intent.intent === 'cash' && !intent.readinessScore) {
    return {
      type: 'tool',
      labelEn: 'Check your cash purchase readiness',
      labelEs: 'Revisa tu preparación para compra en efectivo',
      destination: '/cash-readiness',
      priority: 'medium',
    };
  }

  // Default: explore
  if (!journey.neighborhoodExplored) {
    return {
      type: 'guide',
      labelEn: 'Explore Tucson neighborhoods',
      labelEs: 'Explora los vecindarios de Tucson',
      destination: '/neighborhoods',
      priority: 'low',
    };
  }

  return {
    type: 'chat',
    labelEn: 'Ask Selena anything',
    labelEs: 'Pregúntale a Selena',
    destination: 'selena:open',
    priority: 'low',
  };
}

// ── Continuation Summary ──────────────────────────────────

export interface ContinuationSummary {
  en: string;
  es: string;
  insightsCount: number;
}

/**
 * Generates a human-readable summary of what the system knows.
 * Used in booking hydration panels, Selena greetings, and returning-user heroes.
 */
export function selectContinuationSummary(vip: VisitorIntelligenceProfile): ContinuationSummary {
  const parts_en: string[] = [];
  const parts_es: string[] = [];

  if (vip.intent.intent) {
    const intentLabels: Record<string, [string, string]> = {
      buy: ['buying a home', 'comprar una casa'],
      sell: ['selling your home', 'vender tu casa'],
      cash: ['a cash purchase', 'una compra en efectivo'],
      dual: ['buying and selling', 'comprar y vender'],
      explore: ['exploring options', 'explorando opciones'],
      investor: ['investment properties', 'propiedades de inversión'],
    };
    const [en, es] = intentLabels[vip.intent.intent] || ['real estate', 'bienes raíces'];
    parts_en.push(`interested in ${en}`);
    parts_es.push(`interesado/a en ${es}`);
  }

  if (vip.intent.readinessScore) {
    parts_en.push(`readiness score: ${vip.intent.readinessScore}/100`);
    parts_es.push(`puntuación de preparación: ${vip.intent.readinessScore}/100`);
  }

  if (vip.financial.estimatedValue) {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(vip.financial.estimatedValue);
    parts_en.push(`estimated value: ${formatted}`);
    parts_es.push(`valor estimado: ${formatted}`);
  }

  if (vip.journey.toolsCompleted.length > 0) {
    parts_en.push(`${vip.journey.toolsCompleted.length} tool(s) completed`);
    parts_es.push(`${vip.journey.toolsCompleted.length} herramienta(s) completada(s)`);
  }

  if (vip.journey.guidesCompleted.length > 0) {
    parts_en.push(`${vip.journey.guidesCompleted.length} guide(s) read`);
    parts_es.push(`${vip.journey.guidesCompleted.length} guía(s) leída(s)`);
  }

  if (vip.intent.sellerDecisionPath) {
    const pathLabels: Record<string, [string, string]> = {
      cash: ['leaning toward a cash sale', 'inclinándose hacia venta en efectivo'],
      traditional: ['considering a traditional listing', 'considerando una venta tradicional'],
      consult: ['wants a consultation first', 'quiere una consulta primero'],
    };
    const [en, es] = pathLabels[vip.intent.sellerDecisionPath] || ['exploring options', 'explorando opciones'];
    parts_en.push(en);
    parts_es.push(es);
  }

  const insightsCount = parts_en.length;

  return {
    en: parts_en.length > 0 ? parts_en.join(' · ') : 'New visitor — no data yet',
    es: parts_es.length > 0 ? parts_es.join(' · ') : 'Visitante nuevo — sin datos aún',
    insightsCount,
  };
}
