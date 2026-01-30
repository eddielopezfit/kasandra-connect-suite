/**
 * Lead Identity Bridge
 * Persists lead_id across the V2 concierge ecosystem
 * and syncs with SessionContext for cognitive stage tracking
 */

import { updateSessionContext } from './selenaSession';
import { logEvent } from './logEvent';

const LEAD_ID_KEY = 'selena_lead_id';
const LAST_REPORT_KEY = 'cc_last_report_id';

/**
 * Bridge a lead_id from edge function response into localStorage and SessionContext
 */
export function bridgeLeadIdToV2(leadId: string, source?: string): void {
  if (!leadId || typeof window === 'undefined') return;

  // Persist lead_id
  localStorage.setItem(LEAD_ID_KEY, leadId);

  // Update session context with lead capture signal
  updateSessionContext({
    has_booked: false, // Will be set true on booking confirmation
  });

  // Log bridge event for analytics
  logEvent('lead_id_bridged', {
    lead_id: leadId,
    source: source || 'native_form',
  });

  console.log('[LeadBridge] Lead ID persisted:', leadId);
}

/**
 * Get the current lead_id from localStorage
 */
export function getLeadId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LEAD_ID_KEY);
}

/**
 * Check if we have an existing lead in the system
 */
export function hasExistingLead(): boolean {
  return !!getLeadId();
}

/**
 * Store the last report ID for returning user recognition
 */
export function setLastReportId(reportId: string): void {
  if (!reportId || typeof window === 'undefined') return;
  localStorage.setItem(LAST_REPORT_KEY, reportId);
  updateSessionContext({
    has_viewed_report: true,
    last_report_id: reportId,
  });
}

/**
 * Get the last report ID
 */
export function getLastReportId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_REPORT_KEY);
}

/**
 * Get user name from localStorage (if captured from quiz or form)
 */
export function getStoredUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cc_user_name');
}

/**
 * Store user name for personalization
 */
export function setStoredUserName(name: string): void {
  if (!name || typeof window === 'undefined') return;
  localStorage.setItem('cc_user_name', name.trim());
}

/**
 * Get stored email from localStorage
 */
export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cc_user_email');
}

/**
 * Store email for pre-population
 */
export function setStoredEmail(email: string): void {
  if (!email || typeof window === 'undefined') return;
  localStorage.setItem('cc_user_email', email.trim().toLowerCase());
}

/**
 * Get stored phone from localStorage
 */
export function getStoredPhone(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cc_user_phone');
}

/**
 * Store phone for pre-population
 */
export function setStoredPhone(phone: string): void {
  if (!phone || typeof window === 'undefined') return;
  localStorage.setItem('cc_user_phone', phone.trim());
}
