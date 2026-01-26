/**
 * Cognitive Stage Hook
 * Tracks user's psychological progression through the guide experience
 */

import { useMemo } from 'react';
import { getGuidesRead, getIntent, type JourneyStage } from '@/lib/guides/personalization';
import { getSessionContext } from '@/lib/analytics/selenaSession';

export type CognitiveStageId = 'arriving' | 'exploring' | 'understanding' | 'clarifying' | 'deciding' | 'confident';

export interface CognitiveStage {
  id: CognitiveStageId;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  labelEn: string;
  labelEs: string;
  descriptionEn: string;
  descriptionEs: string;
  microcopyEn: string;
  microcopyEs: string;
  ctaLabelEn: string;
  ctaLabelEs: string;
  ctaAction: 'browse' | 'selena' | 'continue' | 'book';
}

export const COGNITIVE_STAGES: CognitiveStage[] = [
  {
    id: 'arriving',
    level: 1,
    labelEn: 'Arriving',
    labelEs: 'Llegando',
    descriptionEn: 'You\'re just getting started',
    descriptionEs: 'Acabas de comenzar',
    microcopyEn: 'Take your time. Everything you need is here.',
    microcopyEs: 'Tómate tu tiempo. Todo lo que necesitas está aquí.',
    ctaLabelEn: 'Start Exploring',
    ctaLabelEs: 'Comenzar a Explorar',
    ctaAction: 'browse',
  },
  {
    id: 'exploring',
    level: 2,
    labelEn: 'Exploring',
    labelEs: 'Explorando',
    descriptionEn: 'You\'re discovering what\'s available',
    descriptionEs: 'Estás descubriendo lo que hay disponible',
    microcopyEn: 'Great start! Keep exploring to find what fits you.',
    microcopyEs: '¡Buen comienzo! Sigue explorando para encontrar lo que te conviene.',
    ctaLabelEn: 'Ask Selena',
    ctaLabelEs: 'Pregunta a Selena',
    ctaAction: 'selena',
  },
  {
    id: 'understanding',
    level: 3,
    labelEn: 'Understanding',
    labelEs: 'Entendiendo',
    descriptionEn: 'You\'re building a clearer picture',
    descriptionEs: 'Estás formando una imagen más clara',
    microcopyEn: 'You\'re making great progress understanding your options.',
    microcopyEs: 'Estás progresando muy bien entendiendo tus opciones.',
    ctaLabelEn: 'Get Personalized Help',
    ctaLabelEs: 'Obtén Ayuda Personalizada',
    ctaAction: 'selena',
  },
  {
    id: 'clarifying',
    level: 4,
    labelEn: 'Clarifying',
    labelEs: 'Clarificando',
    descriptionEn: 'You\'re narrowing down what matters',
    descriptionEs: 'Estás definiendo lo que importa',
    microcopyEn: 'You know what you want. Let Selena help you refine your path.',
    microcopyEs: 'Sabes lo que quieres. Deja que Selena te ayude a definir tu camino.',
    ctaLabelEn: 'Continue Your Journey',
    ctaLabelEs: 'Continúa Tu Camino',
    ctaAction: 'continue',
  },
  {
    id: 'deciding',
    level: 5,
    labelEn: 'Deciding',
    labelEs: 'Decidiendo',
    descriptionEn: 'You\'re ready to take the next step',
    descriptionEs: 'Estás listo para el siguiente paso',
    microcopyEn: 'When you\'re ready, Kasandra is here to guide you personally.',
    microcopyEs: 'Cuando estés listo, Kasandra está aquí para guiarte personalmente.',
    ctaLabelEn: 'Book a Consultation',
    ctaLabelEs: 'Agendar una Cita',
    ctaAction: 'book',
  },
  {
    id: 'confident',
    level: 6,
    labelEn: 'Confident',
    labelEs: 'Seguro',
    descriptionEn: 'You\'re ready to move forward',
    descriptionEs: 'Estás listo para avanzar',
    microcopyEn: 'You\'ve done your research. Kasandra will personally reach out.',
    microcopyEs: 'Has hecho tu investigación. Kasandra se comunicará personalmente.',
    ctaLabelEn: 'Book a Consultation',
    ctaLabelEs: 'Agendar una Cita',
    ctaAction: 'book',
  },
];

/**
 * Determine cognitive stage based on user signals
 */
function calculateCognitiveStage(
  guidesRead: number,
  hasIntent: boolean,
  hasInteractedWithSelena: boolean,
  hasClickedBooking: boolean
): CognitiveStageId {
  // Stage 6: Confident - has clicked booking or high engagement
  if (hasClickedBooking) {
    return 'confident';
  }

  // Stage 5: Deciding - has intent AND 4+ guides
  if (hasIntent && guidesRead >= 4) {
    return 'deciding';
  }

  // Stage 4: Clarifying - has intent OR 3+ guides
  if (hasIntent || guidesRead >= 3) {
    return 'clarifying';
  }

  // Stage 3: Understanding - 2+ guides read
  if (guidesRead >= 2) {
    return 'understanding';
  }

  // Stage 2: Exploring - 1 guide read or interacted with Selena
  if (guidesRead >= 1 || hasInteractedWithSelena) {
    return 'exploring';
  }

  // Stage 1: Arriving - brand new
  return 'arriving';
}

/**
 * Hook to get current cognitive stage
 */
export function useCognitiveStage() {
  const stageData = useMemo(() => {
    const guidesRead = getGuidesRead();
    const intent = getIntent();
    const context = getSessionContext();
    
    // Check for Selena interaction (from session context or localStorage)
    const hasInteractedWithSelena = typeof window !== 'undefined' 
      ? !!localStorage.getItem('selena_session_id') 
      : false;
    
    // Check if user has clicked booking (tracked in journey actions)
    const journeyActions = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('cc_journey_actions') || '[]')
      : [];
    const hasClickedBooking = journeyActions.includes('book');

    const stageId = calculateCognitiveStage(
      guidesRead.length,
      !!intent,
      hasInteractedWithSelena,
      hasClickedBooking
    );

    const stage = COGNITIVE_STAGES.find(s => s.id === stageId) || COGNITIVE_STAGES[0];

    return {
      stage,
      stageId,
      level: stage.level,
      guidesReadCount: guidesRead.length,
      hasIntent: !!intent,
      intent,
      isFirstVisit: guidesRead.length === 0,
      shouldShowProgressBar: guidesRead.length > 0 || hasInteractedWithSelena,
    };
  }, []);

  return stageData;
}

/**
 * Get stage-aware microcopy for Ask Selena
 */
export function getSelenaPromptForStage(stageId: CognitiveStageId, guidesReadCount: number): {
  promptEn: string;
  promptEs: string;
  showSummaryOffer: boolean;
} {
  const showSummaryOffer = guidesReadCount >= 2;

  switch (stageId) {
    case 'arriving':
      return {
        promptEn: 'Not sure where to start? I can help.',
        promptEs: '¿No sabes por dónde empezar? Puedo ayudarte.',
        showSummaryOffer: false,
      };
    case 'exploring':
      return {
        promptEn: 'Finding the right guide? Let me help narrow it down.',
        promptEs: '¿Buscando la guía correcta? Déjame ayudarte a encontrarla.',
        showSummaryOffer: false,
      };
    case 'understanding':
      return {
        promptEn: showSummaryOffer 
          ? 'Ready for a personalized summary of what you\'ve learned?'
          : 'Have questions about what you\'ve read?',
        promptEs: showSummaryOffer
          ? '¿Listo para un resumen personalizado de lo que has aprendido?'
          : '¿Tienes preguntas sobre lo que has leído?',
        showSummaryOffer,
      };
    case 'clarifying':
      return {
        promptEn: 'I can help you compare options and clarify next steps.',
        promptEs: 'Puedo ayudarte a comparar opciones y clarificar los próximos pasos.',
        showSummaryOffer,
      };
    case 'deciding':
    case 'confident':
      return {
        promptEn: 'Ready to talk with Kasandra? I can help you prepare.',
        promptEs: '¿Listo para hablar con Kasandra? Puedo ayudarte a prepararte.',
        showSummaryOffer,
      };
    default:
      return {
        promptEn: 'Have a question? I\'m here to help.',
        promptEs: '¿Tienes una pregunta? Estoy aquí para ayudar.',
        showSummaryOffer: false,
      };
  }
}
