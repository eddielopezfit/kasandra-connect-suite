/**
 * useJourneyProgress — Bridge between session intelligence and UI layer
 * Reads SessionContext + CognitiveStage and returns structured journey state
 */

import { useMemo } from 'react';
import {
  getSessionContext,
  getGuidesCompleted,
  type Intent,
} from '@/lib/analytics/selenaSession';
import { useCognitiveStage, type CognitiveStageId } from '@/hooks/useCognitiveStage';

export interface NextAction {
  type: 'tool' | 'guide' | 'chat' | 'book';
  labelEn: string;
  labelEs: string;
  destination: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface JourneyProgress {
  intent: Intent | undefined;
  isReturningUser: boolean;

  toolsCompleted: string[];
  toolCount: number;
  guidesCompleted: string[];
  guideCount: number;
  hasReadinessScore: boolean;
  readinessScore: number | undefined;
  primaryPriority: string | undefined;

  hasCalculatorResults: boolean;
  calculatorAdvantage: string | undefined;
  estimatedValue: number | undefined;

  sellerDecisionPath: string | undefined;
  hasSellerDecision: boolean;

  cognitiveStageId: CognitiveStageId;
  cognitiveLevel: number;

  hasExploredNeighborhood: boolean;
  lastNeighborhoodZip: string | undefined;

  isInheritedHome: boolean;
  isMilitary: boolean;

  hasBooked: boolean;
  quizCompleted: boolean;

  journeyDepth: 'new' | 'exploring' | 'engaged' | 'ready';
  confidenceLevel: ConfidenceLevel;
  nextRecommendedAction: NextAction;
}

function deriveJourneyDepth(
  toolCount: number,
  guideCount: number,
  hasIntent: boolean,
  hasReadinessScore: boolean,
  hasSellerDecision: boolean,
  hasBooked: boolean,
): JourneyProgress['journeyDepth'] {
  if (hasReadinessScore || hasSellerDecision || hasBooked) return 'ready';
  if (toolCount >= 1 || guideCount >= 3) return 'engaged';
  if (hasIntent || guideCount >= 1) return 'exploring';
  return 'new';
}

function deriveNextAction(
  intent: Intent | undefined,
  hasReadinessScore: boolean,
  hasExploredNeighborhood: boolean,
  hasSellerDecision: boolean,
  hasCalculatorResults: boolean,
  journeyDepth: JourneyProgress['journeyDepth'],
): NextAction {
  if (journeyDepth === 'ready') {
    return {
      type: 'book',
      labelEn: 'Book Your Consultation',
      labelEs: 'Agenda Tu Consulta',
      destination: '/book',
    };
  }

  if (intent === 'buy') {
    if (!hasReadinessScore) {
      return {
        type: 'tool',
        labelEn: 'Check Your Buyer Readiness',
        labelEs: 'Verifica Tu Preparación',
        destination: '/buyer-readiness',
      };
    }
    if (!hasExploredNeighborhood) {
      return {
        type: 'chat',
        labelEn: 'Explore Neighborhoods',
        labelEs: 'Explora Vecindarios',
        destination: 'selena:neighborhood',
      };
    }
  }

  if (intent === 'sell') {
    if (!hasSellerDecision) {
      return {
        type: 'tool',
        labelEn: 'Start Your Seller Decision',
        labelEs: 'Inicia Tu Decisión de Venta',
        destination: '/seller-decision',
      };
    }
    if (!hasCalculatorResults) {
      return {
        type: 'tool',
        labelEn: 'Compare Cash vs. Traditional',
        labelEs: 'Compara Efectivo vs. Tradicional',
        destination: '/cash-offer-options',
      };
    }
  }

  if (intent === 'cash') {
    if (!hasReadinessScore) {
      return {
        type: 'tool',
        labelEn: 'Check Your Cash Readiness',
        labelEs: 'Verifica Tu Preparación en Efectivo',
        destination: '/cash-readiness',
      };
    }
  }

  if (intent === 'dual' as Intent) {
    if (!hasSellerDecision) {
      return {
        type: 'tool',
        labelEn: 'Start Your Seller Decision',
        labelEs: 'Inicia Tu Decisión de Venta',
        destination: '/seller-decision',
      };
    }
    if (!hasReadinessScore) {
      return {
        type: 'tool',
        labelEn: 'Check Your Buyer Readiness',
        labelEs: 'Verifica Tu Preparación de Compra',
        destination: '/buyer-readiness',
      };
    }
  }

  if (intent === 'explore' as Intent || !intent) {
    if (!hasExploredNeighborhood) {
      return {
        type: 'guide',
        labelEn: 'Explore Tucson Neighborhoods',
        labelEs: 'Explora Vecindarios de Tucson',
        destination: '/neighborhoods',
      };
    }
  }

  return {
    type: 'chat',
    labelEn: 'Ask Selena',
    labelEs: 'Pregunta a Selena',
    destination: 'selena:open',
  };
}

export function useJourneyProgress(): JourneyProgress {
  const { stageId, level } = useCognitiveStage();

  return useMemo(() => {
    const ctx = getSessionContext();
    const guidesCompleted = getGuidesCompleted();

    const intent = ctx?.intent;
    const toolsCompleted = ctx?.tools_completed ?? [];
    const toolCount = toolsCompleted.length;
    const guideCount = guidesCompleted.length;
    const hasReadinessScore = typeof ctx?.readiness_score === 'number';
    const readinessScore = ctx?.readiness_score;
    const primaryPriority = ctx?.primary_priority;
    const hasCalculatorResults = typeof ctx?.calculator_advantage === 'string' && ctx.calculator_advantage.length > 0;
    const calculatorAdvantage = ctx?.calculator_advantage;
    const estimatedValue = ctx?.estimated_value;
    const sellerDecisionPath = ctx?.seller_decision_recommended_path;
    const hasSellerDecision = typeof sellerDecisionPath === 'string' && sellerDecisionPath.length > 0;
    const hasExploredNeighborhood = ctx?.neighborhood_explored === true;
    const lastNeighborhoodZip = ctx?.last_neighborhood_zip;
    const isInheritedHome = ctx?.inherited_home === true;
    const isMilitary = ctx?.situation === 'relocating' && (ctx?.tool_used === 'off_market_buyer' || toolsCompleted.includes('bah_calculator'));
    const hasBooked = ctx?.has_booked === true;
    const quizCompleted = ctx?.quiz_completed === true;

    const isReturningUser = toolCount > 0 || guideCount > 0 || hasReadinessScore;

    const journeyDepth = deriveJourneyDepth(
      toolCount, guideCount, !!intent, hasReadinessScore, hasSellerDecision, hasBooked,
    );

    const nextRecommendedAction = deriveNextAction(
      intent, hasReadinessScore, hasExploredNeighborhood,
      hasSellerDecision, hasCalculatorResults, journeyDepth,
    );

    // Derive confidence level from session signals
    const confidenceLevel: ConfidenceLevel =
      (guideCount >= 5 && toolCount >= 1) || hasReadinessScore || hasSellerDecision || hasBooked
        ? 'high'
        : guideCount >= 3 || toolCount >= 1 || hasCalculatorResults
        ? 'medium'
        : 'low';

    return {
      intent,
      isReturningUser,
      toolsCompleted,
      toolCount,
      guidesCompleted,
      guideCount,
      hasReadinessScore,
      readinessScore,
      primaryPriority,
      hasCalculatorResults,
      calculatorAdvantage,
      estimatedValue,
      sellerDecisionPath,
      hasSellerDecision,
      cognitiveStageId: stageId,
      cognitiveLevel: level,
      hasExploredNeighborhood,
      lastNeighborhoodZip,
      isInheritedHome,
      isMilitary,
      hasBooked,
      quizCompleted,
      journeyDepth,
      confidenceLevel,
      nextRecommendedAction,
    };
  }, [stageId, level]);
}
