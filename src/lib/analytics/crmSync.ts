/**
 * CRM Sync — Client-side trigger for VIP → GHL behavioral sync.
 * Fire-and-forget: errors logged, never thrown.
 * Only fires when user is identified (has lead_id).
 */

import { supabase } from '@/integrations/supabase/client';
import { getLeadId } from '@/lib/analytics/bridgeLeadIdToV2';
import { getSessionContext } from '@/lib/analytics/selenaSession';

type SyncTrigger = 'tool_completion' | 'readiness_threshold' | 'returning_user' | 'context_update';

let lastSyncAt = 0;
const SYNC_COOLDOWN_MS = 30_000; // 30s minimum between syncs

/**
 * Trigger a VIP → CRM sync. Fire-and-forget.
 * Only fires if user has a lead_id and cooldown has elapsed.
 */
export function triggerCRMSync(trigger: SyncTrigger, detail?: string): void {
  const leadId = getLeadId();
  if (!leadId) return; // No identified user — skip

  const now = Date.now();
  if (now - lastSyncAt < SYNC_COOLDOWN_MS) return; // Cooldown
  lastSyncAt = now;

  const ctx = getSessionContext();
  if (!ctx) return;

  const guidesStr = localStorage.getItem('selena_guides_completed');
  const guidesCount = guidesStr ? JSON.parse(guidesStr).length : 0;

  const payload = {
    lead_id: leadId,
    session_id: ctx.session_id,
    intent: ctx.intent,
    timeline: ctx.timeline,
    readiness_score: ctx.readiness_score,
    tools_completed: ctx.tools_completed ?? [],
    guides_read_count: guidesCount,
    estimated_value: ctx.estimated_value,
    estimated_budget: ctx.estimated_budget,
    seller_decision_path: ctx.seller_decision_recommended_path,
    primary_priority: ctx.primary_priority,
    language: ctx.language,
    has_booked: ctx.has_booked ?? false,
    trigger,
    trigger_detail: detail,
  };

  supabase.functions.invoke('sync-vip-to-crm', { body: payload })
    .then(({ error }) => {
      if (error) console.warn('[CRM Sync] Failed:', error.message);
    })
    .catch((e) => console.warn('[CRM Sync] Error:', e));
}
