/**
 * VIP Builder — assembles the canonical Visitor Intelligence Profile
 * from all local + server data sources.
 */

import type {
  VisitorIntelligenceProfile,
  VIPSource,
  VIPIdentity,
  VIPAttribution,
  VIPIntent,
  VIPFinancial,
  VIPJourney,
  VIPMemory,
  CanonicalIntent,
} from './types';
import { getSessionContext, getGuidesCompleted, normalizeIntent } from '@/lib/analytics/selenaSession';
import { getLeadId, getStoredUserName, getStoredEmail, getStoredPhone } from '@/lib/analytics/bridgeLeadIdToV2';
import { getStoredLeadId } from '@/contexts/selena/identityManager';

// ── Server-side data shapes (from edge functions) ─────────
export interface ServerProfileData {
  leadProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    intent?: string;
    timeline?: string;
    situation?: string;
    condition?: string;
    lead_score?: number;
    lead_grade?: string;
    language?: string;
    tags?: string[];
    buyer_criteria?: Record<string, unknown>;
  } | null;
  sessionSnapshot?: {
    intent?: string;
    readiness_score?: number;
    primary_priority?: string;
    tools_used?: string[];
    guides_read?: string[];
    calculator_data?: Record<string, unknown>;
    last_page?: string;
  } | null;
  conversationMemory?: Record<string, unknown>[];
  decisionReceipts?: {
    receipt_type: string;
    receipt_data: Record<string, unknown>;
  }[];
}

/**
 * Build the VIP from local state only (synchronous, no network).
 * Use this for immediate hydration before server data arrives.
 */
export function buildVIPFromLocal(): VisitorIntelligenceProfile {
  const ctx = getSessionContext();
  const sources: VIPSource[] = [];

  // Identity
  const leadId = getLeadId() || getStoredLeadId();
  // Verified-only name: requires a real lead_id to prevent stale "Test Auditor"
  // from leaking into "Welcome back, X" personalization on fresh visitors.
  const rawName = getStoredUserName();
  const nameLower = rawName?.trim().toLowerCase() ?? '';
  const NAME_BLOCKLIST = ['test', 'test auditor', 'test user', 'demo', 'sample', 'lovable', 'admin'];
  const isBlockedName = !!nameLower && NAME_BLOCKLIST.some((b) => nameLower === b || nameLower.startsWith(b + ' '));
  const name = leadId && rawName && !isBlockedName ? rawName : null;
  const email = leadId ? getStoredEmail() : null;
  const phone = leadId ? getStoredPhone() : null;

  if (leadId || name || email || phone) sources.push('localStorage');
  if (ctx) sources.push('sessionContext');

  const identity: VIPIdentity = {
    sessionId: ctx?.session_id || '',
    leadId: leadId,
    name: name,
    email: email,
    phone: phone,
    language: ctx?.language || 'en',
    isReturning: !!(
      leadId ||
      (ctx?.tools_completed && ctx.tools_completed.length > 0) ||
      ctx?.has_booked
    ),
  };

  const attribution: VIPAttribution = {
    utmSource: ctx?.utm_source,
    utmMedium: ctx?.utm_medium,
    utmCampaign: ctx?.utm_campaign,
    utmContent: ctx?.utm_content,
    utmTerm: ctx?.utm_term,
    referrer: ctx?.referrer,
    landingPath: ctx?.landing_path,
    adFunnelSource: ctx?.ad_funnel_source,
    adFunnelValueRange: ctx?.ad_funnel_value_range,
  };

  const intent: VIPIntent = {
    intent: ctx?.intent as CanonicalIntent | undefined,
    timeline: ctx?.timeline,
    situation: ctx?.situation,
    condition: ctx?.condition,
    readinessScore: ctx?.readiness_score,
    primaryPriority: ctx?.primary_priority,
    sellerDecisionPath: ctx?.seller_decision_recommended_path,
    sellerGoalPriority: ctx?.seller_goal_priority,
    propertyConditionRaw: ctx?.property_condition_raw,
  };

  const financial: VIPFinancial = {
    estimatedValue: ctx?.estimated_value,
    mortgageBalance: ctx?.mortgage_balance,
    estimatedBudget: ctx?.estimated_budget,
    calculatorAdvantage: ctx?.calculator_advantage,
    calculatorDifference: ctx?.calculator_difference,
    cashNetProceeds: ctx?.seller_calc_data?.cashNetProceeds,
    traditionalNetProceeds: ctx?.seller_calc_data?.traditionalNetProceeds,
    equityPulseRecommendation: ctx?.equity_pulse_recommendation,
  };

  const guidesCompleted = getGuidesCompleted();
  const toolsCompleted = ctx?.tools_completed || [];

  const journey: VIPJourney = {
    journeyDepth: deriveJourneyDepth(toolsCompleted, guidesCompleted, ctx),
    journeyState: ctx?.journey_state,
    toolsCompleted,
    guidesCompleted,
    quizCompleted: ctx?.quiz_completed || false,
    quizResultPath: ctx?.quiz_result_path,
    hasBooked: ctx?.has_booked || false,
    hasViewedReport: ctx?.has_viewed_report || false,
    lastReportId: ctx?.last_report_id,
    lastPage: ctx?.last_page,
    lastGuideId: ctx?.last_guide_id,
    neighborhoodExplored: ctx?.neighborhood_explored || false,
    lastNeighborhoodZip: ctx?.last_neighborhood_zip,
    offMarketRegistered: ctx?.off_market_registered || false,
  };

  const memory: VIPMemory = {
    turnCount: ctx?.turn_count || 0,
    currentMode: ctx?.current_mode,
    chipPhaseFloor: ctx?.chip_phase_floor || 0,
    persistedFacts: {},
  };

  return {
    identity,
    attribution,
    intent,
    financial,
    journey,
    memory,
    assembledAt: new Date().toISOString(),
    sources,
  };
}

/**
 * Merge server-side data into an existing VIP.
 * Server data wins for identity fields; local data wins for journey progress.
 */
export function mergeServerData(
  local: VisitorIntelligenceProfile,
  server: ServerProfileData,
): VisitorIntelligenceProfile {
  const sources = [...local.sources];
  const merged = structuredClone(local);

  // Lead Profile merge (server identity wins)
  if (server.leadProfile) {
    sources.push('leadProfile');
    merged.identity.name = server.leadProfile.name || merged.identity.name;
    merged.identity.email = server.leadProfile.email || merged.identity.email;
    merged.identity.phone = server.leadProfile.phone || merged.identity.phone;
    merged.identity.isReturning = true;

    // Server intent is authoritative if present
    if (server.leadProfile.intent) {
      const normalized = normalizeIntent(server.leadProfile.intent);
      if (normalized) merged.intent.intent = normalized;
    }
    if (server.leadProfile.timeline) {
      merged.intent.timeline = server.leadProfile.timeline as VIPIntent['timeline'];
    }
    if (server.leadProfile.situation) merged.intent.situation = server.leadProfile.situation;
    if (server.leadProfile.condition) merged.intent.condition = server.leadProfile.condition;
  }

  // Session Snapshot merge (additive — fills gaps)
  if (server.sessionSnapshot) {
    sources.push('sessionSnapshot');
    if (!merged.intent.readinessScore && server.sessionSnapshot.readiness_score != null) {
      merged.intent.readinessScore = server.sessionSnapshot.readiness_score;
    }
    if (!merged.intent.primaryPriority && server.sessionSnapshot.primary_priority) {
      merged.intent.primaryPriority = server.sessionSnapshot.primary_priority;
    }
    // Merge tools/guides (union)
    const serverTools = server.sessionSnapshot.tools_used || [];
    const serverGuides = server.sessionSnapshot.guides_read || [];
    merged.journey.toolsCompleted = [...new Set([...merged.journey.toolsCompleted, ...serverTools])];
    merged.journey.guidesCompleted = [...new Set([...merged.journey.guidesCompleted, ...serverGuides])];
    // Recalculate depth
    merged.journey.journeyDepth = deriveJourneyDepth(
      merged.journey.toolsCompleted,
      merged.journey.guidesCompleted,
      null,
      merged.intent.readinessScore,
      merged.intent.sellerDecisionPath,
      merged.journey.hasBooked,
    );
  }

  // Conversation Memory merge
  if (server.conversationMemory && server.conversationMemory.length > 0) {
    sources.push('conversationMemory');
    const facts: Record<string, unknown> = { ...merged.memory.persistedFacts };
    for (const mem of server.conversationMemory) {
      const key = (mem as { memory_key?: string }).memory_key;
      const value = (mem as { memory_value?: unknown }).memory_value;
      if (key) facts[key] = value;
    }
    merged.memory.persistedFacts = facts;
  }

  // Decision Receipts merge
  if (server.decisionReceipts && server.decisionReceipts.length > 0) {
    sources.push('decisionReceipt');
    for (const receipt of server.decisionReceipts) {
      if (receipt.receipt_type === 'seller_decision' && receipt.receipt_data) {
        const rd = receipt.receipt_data as Record<string, string>;
        if (rd.recommended_path && !merged.intent.sellerDecisionPath) {
          merged.intent.sellerDecisionPath = rd.recommended_path as 'cash' | 'traditional' | 'consult';
        }
      }
    }
  }

  merged.sources = [...new Set(sources)];
  merged.assembledAt = new Date().toISOString();
  return merged;
}

// ── Internal helpers ──────────────────────────────────────

function deriveJourneyDepth(
  toolsCompleted: string[],
  guidesCompleted: string[],
  ctx?: { intent?: string; readiness_score?: number; seller_decision_recommended_path?: string; has_booked?: boolean } | null,
  readinessScore?: number,
  sellerDecisionPath?: string,
  hasBooked?: boolean,
): VIPJourney['journeyDepth'] {
  const rs = readinessScore ?? ctx?.readiness_score;
  const sdp = sellerDecisionPath ?? ctx?.seller_decision_recommended_path;
  const booked = hasBooked ?? ctx?.has_booked;

  if (rs != null || sdp || booked) return 'ready';
  if (toolsCompleted.length >= 1 || guidesCompleted.length >= 3) return 'engaged';
  if (ctx?.intent || guidesCompleted.length >= 1) return 'exploring';
  return 'new';
}
