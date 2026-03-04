/**
 * Session Snapshot — P1.1
 * Persists session context to backend for cross-device/cross-session restoration.
 * Save is debounced (5s trailing, fire-and-forget).
 * Restore is called once on mount when localStorage context is missing/uninitialized.
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionContext, getOrCreateSessionId, type SessionContext } from './selenaSession';
import { logEvent } from './logEvent';

// ============= DEBOUNCE =============
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 5000;

/**
 * Debounced save — coalesces rapid calls into one trailing invocation.
 * Fire-and-forget: errors are logged, never thrown.
 */
export function saveSnapshot(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    _doSave().catch((e) => console.warn('[SessionSnapshot] save error:', e));
  }, DEBOUNCE_MS);
}

async function _doSave(): Promise<void> {
  const ctx = getSessionContext();
  if (!ctx?.session_id) return;

  const leadId = typeof window !== 'undefined' ? localStorage.getItem('selena_lead_id') : null;

  // Build tools_used array from single tool_used field
  const toolsUsed: string[] = [];
  if (ctx.tool_used) toolsUsed.push(ctx.tool_used);

  // Build guides_read array from last_guide_id
  const guidesRead: string[] = [];
  if (ctx.last_guide_id) guidesRead.push(ctx.last_guide_id);

  // Calculator data bucket
  const calculatorData: Record<string, unknown> = {};
  if (ctx.estimated_value) calculatorData.estimated_value = ctx.estimated_value;
  if (ctx.calculator_difference) calculatorData.calculator_difference = ctx.calculator_difference;
  if (ctx.calculator_advantage) calculatorData.calculator_advantage = ctx.calculator_advantage;
  if (ctx.calculator_motivation) calculatorData.calculator_motivation = ctx.calculator_motivation;

  // Context JSON bucket (everything else worth persisting)
  const contextJson: Record<string, unknown> = {};
  if (ctx.timeline) contextJson.timeline = ctx.timeline;
  if (ctx.situation) contextJson.situation = ctx.situation;
  if (ctx.condition) contextJson.condition = ctx.condition;
  if (ctx.chip_phase_floor) contextJson.chip_phase_floor = ctx.chip_phase_floor;
  if (ctx.current_mode) contextJson.current_mode = ctx.current_mode;
  if (ctx.has_booked) contextJson.has_booked = ctx.has_booked;
  if (ctx.quiz_completed) contextJson.quiz_completed = ctx.quiz_completed;
  if (ctx.seller_decision_recommended_path) contextJson.seller_decision_recommended_path = ctx.seller_decision_recommended_path;
  if (ctx.seller_goal_priority) contextJson.seller_goal_priority = ctx.seller_goal_priority;
  if (ctx.property_condition_raw) contextJson.property_condition_raw = ctx.property_condition_raw;
  if (ctx.language) contextJson.language = ctx.language;

  const payload: Record<string, unknown> = {
    session_id: ctx.session_id,
    intent: ctx.intent,
    last_page: ctx.last_page,
    readiness_score: ctx.readiness_score,
    primary_priority: ctx.primary_priority,
    tools_used: toolsUsed,
    guides_read: guidesRead,
    calculator_data: calculatorData,
    context_json: contextJson,
  };

  if (leadId) payload.lead_id = leadId;

  const { error } = await supabase.functions.invoke('upsert-session-snapshot', { body: payload });
  if (!error) {
    logEvent('session_snapshot_saved', { intent: ctx.intent, has_score: !!ctx.readiness_score });
  }
}

// ============= RESTORE =============

export interface SnapshotData {
  session_id: string;
  lead_id?: string;
  intent?: string;
  last_page?: string;
  tools_used?: string[];
  guides_read?: string[];
  readiness_score?: number;
  primary_priority?: string;
  calculator_data?: Record<string, unknown>;
  context_json?: Record<string, unknown>;
}

/**
 * Restore a snapshot from backend. Returns null if none found.
 */
export async function restoreSnapshot(sessionId: string): Promise<SnapshotData | null> {
  try {
    const leadId = typeof window !== 'undefined' ? localStorage.getItem('selena_lead_id') : null;

    const { data, error } = await supabase.functions.invoke('get-session-snapshot', {
      body: { session_id: sessionId, ...(leadId ? { lead_id: leadId } : {}) },
    });

    if (error || !data?.ok || !data?.snapshot) return null;
    return data.snapshot as SnapshotData;
  } catch (e) {
    console.warn('[SessionSnapshot] restore error:', e);
    return null;
  }
}
