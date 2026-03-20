/**
 * Shared types for selena-chat modules
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  context: {
    session_id: string;
    route: string;
    language: "en" | "es";
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    intent?: string;
    situation?: string;
    last_guide_id?: string;
    last_guide_title?: string;
    lastEvents?: string[];
    lead_id?: string;
    inherited_home?: boolean;
    trust_signal_detected?: boolean;
    last_tool_completed?: string;
    last_tool_result?: string;
    quiz_completed?: boolean;
    guides_read?: number;
    guides_completed?: string[];
    entry_source?: string;
    entry_guide_id?: string | null;
    entry_guide_title?: string | null;
    calculator_advantage?: string;
    calculator_difference?: number;
    current_mode?: 1 | 2 | 3 | 4;
    timeline?: string;
    seller_decision_recommended_path?: string;
    seller_goal_priority?: string;
    property_condition_raw?: string;
    tools_completed?: string[];
    chip_phase_floor?: number;
    greeting_phase_seen?: number;
    timeline_last_asked_turn?: number;
    turn_count?: number;
    journey_state?: string;
    readiness_score?: number;
    primary_priority?: string;
    quiz_result_path?: string;
    calculator_motivation?: string;
    estimated_value?: number;
    estimated_budget?: number;
    mortgage_balance?: number;
    last_neighborhood_zip?: string;
    session_trail?: Array<{
      label: string;
      type: 'guide' | 'tool' | 'quiz' | 'page';
      minutes_ago: number;
    }>;
    closing_cost_data?: {
      purchasePrice: number;
      loanType: string;
      downPaymentPercent: number;
      estimatedLow: number;
      estimatedHigh: number;
      totalCashNeeded: number;
    } | null;
    seller_calc_data?: {
      estimatedValue: number;
      mortgageBalance: number;
      cashNetProceeds: number;
      traditionalNetProceeds: number;
      recommendation: string;
      netDifference: number;
      motivation: string;
      timeline: string;
    } | null;
    readiness_entry_data?: {
      score: number;
      primaryPriority: string;
      toolType: 'buyer' | 'seller' | 'cash';
    } | null;
    off_market_data?: {
      areas: string[];
      budgetRange: string;
      timeline: string;
      propertyType: string;
    } | null;
    neighborhood_compare_data?: {
      areasCompared: string[];
    } | null;
    market_intel_data?: {
      daysOnMarket: number;
      saleToListRatio: string;
      holdingCostPerDay: number;
      isLive: boolean;
    } | null;
  };
  history?: ChatMessage[];
}

export type CanonicalIntent = "buy" | "sell" | "cash" | "dual" | "explore" | "invest";
