/**
 * Visitor Intelligence Profile (VIP) — Phase 2: DCOS V2
 * Canonical single source of truth for all visitor state.
 * Merges: localStorage, SessionContext, lead_profiles, session_snapshots,
 *         conversation_memory, decision_receipts.
 */

// ── Identity ──────────────────────────────────────────────
export interface VIPIdentity {
  sessionId: string;
  leadId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  language: 'en' | 'es';
  isReturning: boolean;
}

// ── Attribution ───────────────────────────────────────────
export interface VIPAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPath?: string;
  adFunnelSource?: string;
  adFunnelValueRange?: string;
}

// ── Intent & Readiness ────────────────────────────────────
export type CanonicalIntent = 'buy' | 'sell' | 'cash' | 'investor' | 'explore' | 'dual';
export type CanonicalTimeline = 'asap' | '30_days' | '60_90' | 'exploring';

export interface VIPIntent {
  intent?: CanonicalIntent;
  timeline?: CanonicalTimeline;
  situation?: string;
  condition?: string;
  readinessScore?: number;
  primaryPriority?: string;
  sellerDecisionPath?: 'cash' | 'traditional' | 'consult';
  sellerGoalPriority?: string;
  propertyConditionRaw?: string;
}

// ── Financial Context ─────────────────────────────────────
export interface VIPFinancial {
  estimatedValue?: number;
  mortgageBalance?: number;
  estimatedBudget?: number;
  calculatorAdvantage?: 'cash' | 'traditional' | 'consult';
  calculatorDifference?: number;
  cashNetProceeds?: number;
  traditionalNetProceeds?: number;
  equityPulseRecommendation?: string;
}

// ── Journey Progress ──────────────────────────────────────
export interface VIPJourney {
  journeyDepth: 'new' | 'exploring' | 'engaged' | 'ready';
  journeyState?: 'explore' | 'evaluate' | 'decide';
  toolsCompleted: string[];
  guidesCompleted: string[];
  quizCompleted: boolean;
  quizResultPath?: string;
  hasBooked: boolean;
  hasViewedReport: boolean;
  lastReportId?: string;
  lastPage?: string;
  lastGuideId?: string;
  neighborhoodExplored: boolean;
  lastNeighborhoodZip?: string;
  offMarketRegistered: boolean;
}

// ── Conversation Memory ───────────────────────────────────
export interface VIPMemory {
  turnCount: number;
  currentMode?: 1 | 2 | 3 | 4;
  chipPhaseFloor: number;
  persistedFacts: Record<string, unknown>;
}

// ── The Canonical VIP ─────────────────────────────────────
export interface VisitorIntelligenceProfile {
  identity: VIPIdentity;
  attribution: VIPAttribution;
  intent: VIPIntent;
  financial: VIPFinancial;
  journey: VIPJourney;
  memory: VIPMemory;
  /** ISO timestamp of when this VIP was assembled */
  assembledAt: string;
  /** Data sources that contributed to this VIP */
  sources: VIPSource[];
}

export type VIPSource =
  | 'localStorage'
  | 'sessionContext'
  | 'leadProfile'
  | 'sessionSnapshot'
  | 'conversationMemory'
  | 'decisionReceipt';
