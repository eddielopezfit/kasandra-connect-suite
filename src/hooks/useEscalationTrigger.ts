/**
 * useEscalationTrigger — Monitors session state for high-intent signals
 * Returns whether a proactive booking nudge should be shown.
 * 
 * Trigger conditions (any ONE activates):
 * 1. Readiness score >= 70 AND user has NOT booked
 * 2. Seller Decision Wizard completed AND user has NOT booked
 * 3. 3+ tools completed in one session AND user has NOT booked
 * 4. Calculator shows >$50K equity advantage AND user has NOT booked
 * 
 * Suppression rules:
 * - Never show if user has already booked (has_booked === true)
 * - Never show if already dismissed this session (sessionStorage flag)
 * - Never show on /book or /book/confirmed pages
 * - Show max once per session
 */

import { useMemo } from 'react';
import { getSessionContext } from '@/lib/analytics/selenaSession';

export type EscalationReason = 
  | 'high_readiness'
  | 'seller_decision_complete'
  | 'deep_engagement'
  | 'high_equity';

export interface EscalationState {
  shouldShow: boolean;
  reason: EscalationReason | null;
  messageEn: string;
  messageEs: string;
  ctaLabelEn: string;
  ctaLabelEs: string;
}

const DISMISSED_KEY = 'escalation_dismissed';

function isDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissEscalation(): void {
  try {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  } catch {
    // silent
  }
}

export function useEscalationTrigger(): EscalationState {
  return useMemo(() => {
    const none: EscalationState = { shouldShow: false, reason: null, messageEn: '', messageEs: '', ctaLabelEn: '', ctaLabelEs: '' };

    // Suppression checks
    if (isDismissed()) return none;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.startsWith('/book')) return none;

    const ctx = getSessionContext();
    if (!ctx) return none;
    if (ctx.has_booked) return none;

    // Trigger 1: High readiness score
    if (typeof ctx.readiness_score === 'number' && ctx.readiness_score >= 70) {
      return {
        shouldShow: true,
        reason: 'high_readiness',
        messageEn: `Your readiness score is ${ctx.readiness_score}/100 — you're in a strong position. A 15-minute strategy call with Kasandra could save you time and money.`,
        messageEs: `Tu puntaje de preparación es ${ctx.readiness_score}/100 — estás en una posición fuerte. Una llamada de 15 minutos con Kasandra podría ahorrarte tiempo y dinero.`,
        ctaLabelEn: 'Book a Strategy Call',
        ctaLabelEs: 'Agenda una Llamada',
      };
    }

    // Trigger 2: Seller Decision Wizard completed
    if (ctx.seller_decision_recommended_path) {
      const pathLabel = ctx.seller_decision_recommended_path === 'cash' ? 'cash offer' : ctx.seller_decision_recommended_path === 'traditional' ? 'traditional listing' : 'your options';
      const pathLabelEs = ctx.seller_decision_recommended_path === 'cash' ? 'oferta en efectivo' : ctx.seller_decision_recommended_path === 'traditional' ? 'listado tradicional' : 'sus opciones';
      return {
        shouldShow: true,
        reason: 'seller_decision_complete',
        messageEn: `Your Decision Wizard recommends exploring ${pathLabel}. Kasandra can review this with you personally.`,
        messageEs: `El Asistente de Decisión recomienda explorar ${pathLabelEs}. Kasandra puede revisarlo personalmente con usted.`,
        ctaLabelEn: 'Talk to Kasandra',
        ctaLabelEs: 'Hablar con Kasandra',
      };
    }

    // Trigger 3: Deep engagement (3+ tools)
    const toolCount = ctx.tools_completed?.length ?? 0;
    if (toolCount >= 3) {
      return {
        shouldShow: true,
        reason: 'deep_engagement',
        messageEn: `You've completed ${toolCount} tools — you've done more research than most. Kasandra can put it all together for you in one conversation.`,
        messageEs: `Has completado ${toolCount} herramientas — has investigado más que la mayoría. Kasandra puede unir todo en una conversación.`,
        ctaLabelEn: 'Book Your Session',
        ctaLabelEs: 'Agenda Tu Sesión',
      };
    }

    // Trigger 4: High equity from calculator
    if (typeof ctx.calculator_difference === 'number' && ctx.calculator_difference >= 50000) {
      const diff = `$${ctx.calculator_difference.toLocaleString()}`;
      return {
        shouldShow: true,
        reason: 'high_equity',
        messageEn: `With a ${diff} difference between paths, the right strategy matters. Kasandra can help you maximize your outcome.`,
        messageEs: `Con una diferencia de ${diff} entre caminos, la estrategia correcta importa. Kasandra puede ayudarte a maximizar tu resultado.`,
        ctaLabelEn: 'Get Expert Guidance',
        ctaLabelEs: 'Obtén Orientación Experta',
      };
    }

    return none;
  }, []);
}
