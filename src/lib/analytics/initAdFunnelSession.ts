/**
 * Ad Funnel Session Bridge
 * Initializes session context for ad funnel visitors
 * and bridges data to V2 ecosystem for continuity
 */

import { 
  initSessionContext, 
  updateSessionContext,
} from './selenaSession';

// Re-export from canonical source to avoid duplicate implementations
export { bridgeLeadIdToV2, setStoredUserName, setStoredEmail, setStoredPhone } from './bridgeLeadIdToV2';

/**
 * Initialize session for ad funnel visitors
 * Captures UTMs and sets ad funnel source
 */
export function initAdFunnelSession(): void {
  // Initialize with English (ad funnel is English-only currently)
  initSessionContext('en');
  
  // Capture UTMs from URL
  const params = new URLSearchParams(window.location.search);
  
  updateSessionContext({
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

  updateSessionContext({
    intent: 'cash', // Normalized to canonical V2 intent value
    timeline: quizAnswers.timeline ? timelineMap[quizAnswers.timeline] : undefined,
    situation: quizAnswers.situation ? situationMap[quizAnswers.situation] : undefined,
    condition: quizAnswers.condition ? conditionMap[quizAnswers.condition] : undefined,
    quiz_completed: true,
    ad_funnel_value_range: quizAnswers.value,
  });
}
