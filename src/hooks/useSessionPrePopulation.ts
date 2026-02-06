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
function mapIntent(sessionIntent?: string): string | undefined {
  if (!sessionIntent) return undefined;
  
  const intentMap: Record<string, string> = {
    buy: 'buyer',
    sell: 'seller',
    cash: 'cash', // Form uses canonical value now
    investor: 'unknown',
    explore: 'unknown',
  };
  
  return intentMap[sessionIntent] || 'unknown';
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
 */
export function getFullSessionDossier(): Record<string, unknown> {
  const session = getSessionContext();
  
  if (!session) {
    return {};
  }
  
  // Build fields object
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
    
    // Quiz completion
    quiz_completed: session.quiz_completed || false,
    quiz_result_path: session.quiz_result_path,
    
    // Decision room engagement
    has_viewed_report: session.has_viewed_report || false,
    last_report_id: session.last_report_id,
    has_booked: session.has_booked || false,
    
    // Attribution
    utm_source: session.utm_source,
    utm_campaign: session.utm_campaign,
    utm_medium: session.utm_medium,
    utm_content: session.utm_content,
    referrer: session.referrer,
    
    // Ad funnel bridge
    ad_funnel_source: session.ad_funnel_source,
    ad_funnel_value_range: session.ad_funnel_value_range,
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
