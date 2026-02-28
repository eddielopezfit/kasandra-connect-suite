/**
 * Hook to pre-populate form fields from SessionContext
 * Enables "zero redundant typing" for users who've completed quizzes/calculators
 */

import { useState, useEffect } from 'react';
import { getSessionContext, SessionContext } from '@/lib/analytics/selenaSession';
import { getStoredUserName, getStoredEmail, getStoredPhone } from '@/lib/analytics/bridgeLeadIdToV2';

export interface PrePopulationData {
  name?: string;
  email?: string;
  phone?: string;
  preferredLanguage?: 'en' | 'es';
  intent?: string;
  timeline?: string;
  situation?: string;
  condition?: string;
  priceRange?: string;
  preApproved?: string;
  // Signals for UI
  hasPrePopulatedData: boolean;
  sessionContext: SessionContext | null;
}

/**
 * Map SessionContext intent to form intent value
 */
/**
 * Map SessionContext intent (canonical) to form select value
 * Form values: buyer, seller, cash, buy_and_sell, browsing
 */
function mapIntent(sessionIntent?: string): string | undefined {
  if (!sessionIntent) return undefined;
  
  const intentMap: Record<string, string> = {
    buy: 'buyer',
    sell: 'seller',
    cash: 'cash',
    dual: 'buy_and_sell',
    investor: 'browsing',
    explore: 'browsing',
  };
  
  return intentMap[sessionIntent] || undefined;
}

/**
 * Map SessionContext timeline to form timeline value
 */
function mapTimeline(sessionTimeline?: string): string | undefined {
  if (!sessionTimeline) return undefined;
  
  const timelineMap: Record<string, string> = {
    asap: 'immediately',
    '30_days': '1_3_months',
    '60_90': '3_6_months',
    exploring: 'researching',
  };
  
  return timelineMap[sessionTimeline] || 'researching';
}

/**
 * Hook to get pre-populated form data from session context and localStorage
 */
export function useSessionPrePopulation(): PrePopulationData {
  const [prePopData, setPrePopData] = useState<PrePopulationData>({
    hasPrePopulatedData: false,
    sessionContext: null,
  });

  useEffect(() => {
    const session = getSessionContext();
    
    // Get stored contact info
    const storedName = getStoredUserName();
    const storedEmail = getStoredEmail();
    const storedPhone = getStoredPhone();
    
    const data: PrePopulationData = {
      sessionContext: session,
      hasPrePopulatedData: false,
    };
    
    // Pre-populate from stored contact info
    if (storedName) data.name = storedName;
    if (storedEmail) data.email = storedEmail;
    if (storedPhone) data.phone = storedPhone;
    
    // Pre-populate from session context
    if (session) {
      // NOTE: Language is NOT pre-populated from session.
      // The form uses the current LanguageContext as default to respect the user's
      // active language toggle choice, preventing stale session language overwrites.
      // See: Consultation Intake Form Language Data Contract Audit
      
      if (session.intent) {
        data.intent = mapIntent(session.intent);
      }
      
      if (session.timeline) {
        data.timeline = mapTimeline(session.timeline);
      }
      
      if (session.situation) {
        data.situation = session.situation;
      }
      
      if (session.condition) {
        data.condition = session.condition;
      }
    }
    
    // Determine if we have pre-populated data
    data.hasPrePopulatedData = !!(
      data.name ||
      data.email ||
      data.phone ||
      data.intent ||
      data.timeline
    );
    
    setPrePopData(data);
  }, []);

  return prePopData;
}

/**
 * Get the full session dossier for edge function submission
 * Filters out undefined values to prevent edge function issues
 * 
 * IMPORTANT: This dossier is used by submit-consultation-intake and must include:
 * - Buyer Readiness outputs (readiness_score, primary_priority)
 * - Tool usage signals (tool_used, last_tool_result)
 * - All decision room engagement signals
 */
export function getFullSessionDossier(): Record<string, unknown> {
  const session = getSessionContext();
  
  if (!session) {
    return {};
  }
  
  // Build fields object - comprehensive session capture
  const fields: Record<string, unknown> = {
    // Session identity
    session_id: session.session_id,
    session_source: session.landing_path,
    
    // Intent & timeline
    intent: session.intent,
    timeline: session.timeline,
    
    // Property context
    situation: session.situation,
    condition: session.condition,
    
    // Tool usage (calculator results)
    tool_used: session.tool_used,
    last_tool_result: session.last_tool_result,
    
    // Buyer Readiness outputs (Intelligence Injection)
    readiness_score: session.readiness_score,
    primary_priority: session.primary_priority,
    
    // Quiz completion
    quiz_completed: session.quiz_completed || false,
    quiz_result_path: session.quiz_result_path,
    
    // Decision room engagement
    has_viewed_report: session.has_viewed_report || false,
    last_report_id: session.last_report_id,
    has_booked: session.has_booked || false,
    
    // Last viewed content
    last_page: session.last_page,
    last_guide_id: session.last_guide_id,
    last_quiz_id: session.last_quiz_id,
    
    // Attribution
    utm_source: session.utm_source,
    utm_campaign: session.utm_campaign,
    utm_medium: session.utm_medium,
    utm_content: session.utm_content,
    utm_term: session.utm_term,
    referrer: session.referrer,
    
    // Ad funnel bridge
    ad_funnel_source: session.ad_funnel_source,
    ad_funnel_value_range: session.ad_funnel_value_range,
    
    // Seller Decision Path
    seller_decision_step: session.seller_decision_step,
    seller_decision_recommended_path: session.seller_decision_recommended_path,
    seller_goal_priority: session.seller_goal_priority,
    property_condition_raw: session.property_condition_raw,
  };
  
  // Filter out undefined values to prevent edge function issues
  const dossier: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      dossier[key] = value;
    }
  }
  
  return dossier;
}
