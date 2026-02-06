/**
 * Ad Funnel Session Bridge
 * Initializes session context for ad funnel visitors
 * and bridges data to V2 ecosystem for continuity
 * 
 * Uses write-once guards to prevent overwriting user-declared context
 */

import { 
  initSessionContext, 
  updateSessionContext,
  setFieldsIfEmpty,
} from './selenaSession';

// Re-export from canonical source to avoid duplicate implementations
export { bridgeLeadIdToV2, setStoredUserName, setStoredEmail, setStoredPhone } from './bridgeLeadIdToV2';

/**
 * Initialize session for ad funnel visitors
 * Captures UTMs and sets ad funnel source
 * Uses guarded writes to prevent overwriting existing context
 */
export function initAdFunnelSession(): void {
  // Initialize with English (ad funnel is English-only currently)
  initSessionContext('en');
  
  // Capture UTMs from URL
  const params = new URLSearchParams(window.location.search);
  
  // Use guarded writes for fields that should not overwrite existing user context
  // landing_path and UTMs can be set directly as they're attribution data
  setFieldsIfEmpty({
    landing_path: window.location.pathname,
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    ad_funnel_source: window.location.pathname.includes('seller') 
      ? 'seller_landing' 
      : undefined,
  });
}

/**
 * Bridge quiz results from ad funnel to V2 session context
 * Maps quiz answer strings to SessionContext field values
 * 
 * IMPORTANT: Uses setFieldsIfEmpty to prevent overwriting user-declared context
 * if user loops back through the funnel. Exception: quiz_completed is always set
 * since completing the quiz is a definitive event.
 */
export function bridgeQuizResultsToV2(quizAnswers: {
  situation?: string;
  condition?: string;
  timeline?: string;
  value?: string;
}): void {
  const timelineMap: Record<string, 'asap' | '30_days' | '60_90' | 'exploring'> = {
    'asap': 'asap',
    'soon': '30_days',
    'flexible': '60_90',
    'no-rush': 'exploring',
  };
  
  const situationMap: Record<string, 'inherited' | 'relocating' | 'other'> = {
    'inherited': 'inherited',
    'relocating': 'relocating',
    'downsizing': 'other',
    'other': 'other',
  };
  
  const conditionMap: Record<string, 'move_in_ready' | 'minor_repairs' | 'distressed'> = {
    'excellent': 'move_in_ready',
    'good': 'minor_repairs',
    'fair': 'distressed',
    'poor': 'distressed',
  };

  // Use guarded writes for user-declared fields (prevents overwrite on funnel re-entry)
  setFieldsIfEmpty({
    intent: 'cash', // Normalized to canonical V2 intent value
    timeline: quizAnswers.timeline ? timelineMap[quizAnswers.timeline] : undefined,
    situation: quizAnswers.situation ? situationMap[quizAnswers.situation] : undefined,
    condition: quizAnswers.condition ? conditionMap[quizAnswers.condition] : undefined,
    ad_funnel_value_range: quizAnswers.value,
  });
  
  // quiz_completed is always set (definitive event, not user-declared preference)
  updateSessionContext({ quiz_completed: true });
}
