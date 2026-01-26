/**
 * Event Logging for Selena Analytics
 * All logging functions fail silently to never crash the UI
 */

import { getOrCreateSessionId, getSessionContext } from './selenaSession';

const LOG_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/selena-log-event`;

export type EventType =
  | 'page_view'
  | 'selena_open'
  | 'selena_close'
  | 'selena_message_user'
  | 'selena_message_ai'
  | 'chat_action_click'
  | 'suggested_reply_click'
  | 'my_report_click'
  | 'guide_open'
  | 'guide_cta_click'
  | 'quiz_start'
  | 'quiz_complete'
  | 'book_click'
  | 'phone_click'
  | 'cta_click'
  | 'form_submit'
  | 'form_open'
  | 'lead_capture'
  | 'report_view'
  | 'report_cta_click'
  | 'report_generate_start'
  | 'report_generate_success'
  | 'report_generate_error'
  | 'report_empty_state_shown'
  | 'report_error'
  | 'handoff_offer_shown'
  | 'handoff_booking_click'
  | 'handoff_slot_select'
  | 'handoff_request_callback'
  | 'handoff_keep_chatting'
  | 'handoff_create_start'
  | 'handoff_create_success'
  | 'handoff_create_error'
  | 'handoff_channel_select'
  | 'handoff_notify_success'
  | 'handoff_notify_error'
  | 'handoff_booking_opened'
  | 'handoff_text_request'
  // Guides Digital Concierge Experience
  | 'guides_page_view'
  | 'hero_cta_click'
  | 'recommended_guide_click'
  | 'selena_prompt_click'
  | 'journey_checkpoint_shown'
  // Guide scroll engagement (frontend only)
  | 'guide_scroll_50'
  | 'guide_complete'
  // Concierge Tabs
  | 'concierge_tab_open'
  | 'concierge_intent_click'
  | 'guide_browse_click'
  | 'priority_call_click'
  | 'report_view_click'
  // Guide Library Analytics (Phase 1)
  | 'guide_opened'
  | 'guide_category_selected'
  | 'ask_selena_clicked'
  | 'personalized_summary_offered'
  | 'consultation_cta_clicked'
  | 'start_here_intent_selected'
  | 'situation_selected'
  // UI events
  | 'ui_language_toggle';

export interface EventPayload {
  [key: string]: unknown;
}

/**
 * Core event logging function - calls edge function
 * NEVER throws - always fails silently
 */
export async function logEvent(
  eventType: EventType,
  payload: EventPayload = {}
): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const context = getSessionContext();
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Enrich payload with context
    const enrichedPayload = {
      ...payload,
      route: payload.route || currentRoute,
      language: context?.language,
      utm_source: context?.utm_source,
      utm_campaign: context?.utm_campaign,
      utm_medium: context?.utm_medium,
      timestamp: new Date().toISOString(),
    };

    // Fire and forget - don't await in production for performance
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        sessionId,
        eventType,
        payload: enrichedPayload,
      }),
    }).catch((e) => {
      console.warn('[Selena] Event log failed:', e);
    });
    
  } catch (e) {
    // Silent fail - never crash the UI for analytics
    console.warn('[Selena] Event logging error:', e);
  }
}

// ============= Helper Functions =============

/**
 * Log a page view
 */
export function logPageView(route: string, extras: EventPayload = {}): void {
  logEvent('page_view', { route, ...extras });
}

/**
 * Log Selena chat drawer open
 */
export function logSelenaOpen(route: string): void {
  logEvent('selena_open', { route });
}

/**
 * Log Selena chat drawer close
 */
export function logSelenaClose(route: string): void {
  logEvent('selena_close', { route });
}

/**
 * Log user message in Selena chat
 */
export function logSelenaMessageUser(message: string, route: string): void {
  logEvent('selena_message_user', { 
    message: message.substring(0, 500), // Truncate for storage
    route,
  });
}

/**
 * Log AI response in Selena chat
 */
export function logSelenaMessageAI(reply: string, route: string, hasActions: boolean): void {
  logEvent('selena_message_ai', { 
    reply: reply.substring(0, 500),
    route,
    has_actions: hasActions,
  });
}

/**
 * Log chat action button click
 */
export function logChatActionClick(label: string, href: string | undefined, route: string): void {
  logEvent('chat_action_click', { label, href, route });
}

/**
 * Log guide page open
 */
export function logGuideOpen(guideId: string, guideTitle: string): void {
  logEvent('guide_open', { guide_id: guideId, guide_title: guideTitle });
}

/**
 * Log CTA click within a guide
 */
export function logGuideCTAClick(guideId: string, ctaType: string, destination: string): void {
  logEvent('guide_cta_click', { guide_id: guideId, cta_type: ctaType, destination });
}

/**
 * Log quiz start
 */
export function logQuizStart(quizId: string): void {
  logEvent('quiz_start', { quiz_id: quizId });
}

/**
 * Log quiz completion
 */
export function logQuizComplete(quizId: string, result: EventPayload = {}): void {
  logEvent('quiz_complete', { quiz_id: quizId, ...result });
}

/**
 * Log book consultation click
 */
export function logBookClick(source: string): void {
  logEvent('book_click', { source });
}

/**
 * Log phone click
 */
export function logPhoneClick(source: string): void {
  logEvent('phone_click', { source });
}

/**
 * Log generic CTA click
 */
export function logCTAClick(ctaName: string, destination: string, extras: EventPayload = {}): void {
  logEvent('cta_click', { cta: ctaName, destination, ...extras });
}

// Legacy exports for backward compatibility
export const logChatOpen = logSelenaOpen;
export const logChatClose = logSelenaClose;
export const logChatMessageUser = logSelenaMessageUser;
export const logChatMessageAI = logSelenaMessageAI;
