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
  | 'report_download'
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
  | 'off_market_registered'
  | 'off_market_criteria_saved'
  | 'report_view_click'
  // My Options routing
  | 'concierge_valuation_click'
  | 'concierge_cash_comparison_click'
  | 'concierge_buyer_readiness_click'
  | 'decision_room_visit'
  // Guide Library Analytics (Phase 1)
  | 'guide_opened'
  | 'guide_category_selected'
  | 'ask_selena_clicked'
  | 'personalized_summary_offered'
  | 'consultation_cta_clicked'
  | 'start_here_intent_selected'
  | 'situation_selected'
  // Calculator events (Phase 1)
  | 'calculator_open'
  | 'calculator_step_complete'
  | 'calculator_complete'
  | 'calculator_results_view'
  | 'calculator_cta_click'
  // Decision Room tracking (Architecture Plan)
  | 'private_cash_review_view'
  | 'consultation_booked'
  // Identity bridge events
  | 'google_auth_complete'
  | 'auth_lead_bridge_success'
  | 'lead_id_bridged'
  // UI events
  | 'ui_language_toggle'
  // Consultation intake events
  | 'consultation_intake_submitted'
  | 'native_form_submit'
  // Proactive engagement events
  | 'selena_proactive_loss_aversion'
  // Chat UI events
  | 'selena_minimized'
  | 'selena_restored'
  | 'selena_booking_confirmation'
  | 'selena_clear_history'
  // Decision-Compression Guide System
  | 'guide_authority_cta_view'
  | 'guide_authority_cta_click'
  | 'selena_guide_handoff_click'
  // Tool lifecycle events (Sprint Opus 4.6)
  | 'tool_started'
  | 'tool_completed'
  | 'tool_abandoned'
  // Booking lifecycle events (Sprint Opus 4.6)
  | 'booking_started'
  | 'booking_submitted'
  | 'booking_completed'
  // Selena Mode Tracking (Decision Certainty Engine v2)
  | 'selena_entry'
  | 'selena_mode_transition'
  | 'handoff_deferred'
  // Phase 2: Context persistence events
  | 'selena_opened'
  | 'guide_cta_clicked'
  // Neighborhood Intelligence (Phase 1)
  | 'neighborhood_profile_generated'
  | 'neighborhood_profile_cached'
  // Neighborhood Quiz (Phase 2)
  | 'neighborhood_quiz_started'
  | 'neighborhood_quiz_completed'
  // Seller Decision Path
  | 'seller_decision_started'
  | 'seller_decision_step_viewed'
  | 'seller_decision_step_completed'
  | 'seller_decision_completed'
  | 'decision_receipt_generated'
  | 'decision_receipt_viewed'
  | 'seller_decision_contact_submitted'
  | 'seller_decision_neighborhood_started'
  | 'seller_decision_neighborhood_completed'
  | 'seller_decision_neighborhood_skipped'
  | 'guide_exit_ramp_clicked'
  | 'guide_mid_cta_clicked'
  // Phase 3: Decision Lane
  | 'decision_lane_selected'
  // Chip Governance Analytics
  | 'selena_chip_clicked'
  // Chip Governance Drift Detection
  | 'selena_chip_unmatched'
  // P1.1: Session Snapshot observability
  | 'session_snapshot_saved'
  | 'session_snapshot_restored'
  // Equity Pulse (Saved Utility)
  | 'seller_timeline_step_completed'
  | 'seller_timeline_completed'
  | 'equity_pulse_saved'
  | 'equity_pulse_shared'
  // Neighborhood Intelligence Hub
  | 'neighborhood_page_view'
  // Guide Synthesis CTA
  | 'guide_synthesis_cta_shown'
  | 'guide_synthesis_cta_click'
  // Valuation request (Phase: 5 High-Impact Tools)
  | 'valuation_request_started'
  | 'valuation_request_completed'
  | 'tool_capture_dismissed'
  | 'tool_capture_submitted'
  | 'referral_share_click';

export interface EventPayload {
  [key: string]: unknown;
}

// ============= DEV-ONLY Event Buffer =============
// In-memory ring buffer for /v2/qa-determinism diagnostics
// Never allocates in production (tree-shaken by import.meta.env.DEV)
// Stores metadata only — never payload values, never PII

interface DevEventEntry {
  event_type: string;
  timestamp: string;
  payload_keys: string[];
}

const DEV_EVENT_BUFFER: DevEventEntry[] = [];

/**
 * Returns a frozen copy of the last 50 dev events (metadata only).
 * Empty array in production.
 */
export function getDevEventBuffer(): readonly DevEventEntry[] {
  return Object.freeze([...DEV_EVENT_BUFFER]);
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
    // DEV-ONLY: capture event metadata (keys only, never values)
    if (import.meta.env.DEV) {
      DEV_EVENT_BUFFER.push({
        event_type: eventType,
        timestamp: new Date().toISOString(),
        payload_keys: Object.keys(payload ?? {}),
      });
      if (DEV_EVENT_BUFFER.length > 50) DEV_EVENT_BUFFER.shift();
    }

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const context = getSessionContext();
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Enrich payload with context (payload values win over session defaults)
    const enrichedPayload = {
      route: currentRoute,
      language: context?.language,
      utm_source: context?.utm_source,
      utm_campaign: context?.utm_campaign,
      utm_medium: context?.utm_medium,
      timestamp: new Date().toISOString(),
      ...payload,
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
