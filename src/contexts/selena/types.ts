import { type MappedReply } from '@/lib/registry/chipsRegistry';

export type EntrySource = 
  | 'calculator' 
  | 'guide_handoff' 
  | 'guide_exit_ramp'
  | 'guide_mid_cta'
  | 'synthesis' 
  | 'hero'
  | 'hero_returning'
  | 'floating' 
  | 'proactive'
  | 'question'
  | 'post_booking'
  | 'quiz_result'
  | 'seller_decision'
  | 'ad_funnel_text_trigger'
  | '404_page'
  | 'post_funnel_unlock'
  | 'pre_unlock'
  | 'buyer_readiness_capture'
  | 'off_market_capture'
  | 'cash_offer_options_hero'
  | 'cash_readiness_capture'
  | 'community_mid_page'
  | 'podcast_page'
  | 'seller_readiness_capture'
  | 'market_intelligence'
  | 'neighborhood_compare'
  | 'buyer_closing_costs'
  | 'seller_timeline'
  | 'neighborhoods_index'
  | 'neighborhood_detail'
  | 'off_market_registered'
  | 'neighborhood_compare_result'
  | 'market_intelligence_result'
  | 'cta_section'
  | 'buy_hero'
  | 'sell_hero'
  | 'proactive_homepage'
  | 'buyer_fork'
   | 'seller_fork'
   | 'cash_fork'
  | 'about_page'
  | 'contact_page'
   | 'selena_ai_page'
   | 'selena_ai_page_demo'
   | 'homepage_selena_section'
   | 'homepage_banner'
   | 'sell_comparison_traditional'
   | 'sell_comparison_undecided'
   | 'instant_answer_affordability'
    | 'instant_answer_value'
    | 'footer_cta'
    | 'guide_synthesis'
    | 'affordability_calculator'
    | 'bah_calculator'
    | 'home_valuation'
    | 'cash_offer_bottom'
    | 'sticky_mobile_buy'
    | 'sticky_mobile_sell';

export interface EntryContext {
  estimatedBudget?: number;
  source: EntrySource;
  calculatorAdvantage?: 'cash' | 'traditional' | 'consult';
  calculatorDifference?: number;
  guideId?: string;
  guideTitle?: string;
  guideCategory?: string;
  guidesReadCount?: number;
  intent?: string;
  userName?: string;
  prefillMessage?: string;
  neighborhoodSlug?: string;
  neighborhoodName?: string;
  closingCostData?: {
    purchasePrice: number;
    loanType: string;
    downPaymentPercent: number;
    estimatedLow: number;
    estimatedHigh: number;
    totalCashNeeded: number;
  };
  sellerCalcData?: {
    estimatedValue: number;
    mortgageBalance: number;
    cashNetProceeds: number;
    traditionalNetProceeds: number;
    recommendation: string;
    netDifference: number;
    motivation: string;
    timeline: string;
  };
  readinessData?: {
    score: number;
    primaryPriority: string;
    toolType: 'buyer' | 'seller' | 'cash';
  };
  offMarketData?: {
    areas: string[];
    budgetRange: string;
    timeline: string;
    propertyType: string;
  };
  neighborhoodCompareData?: {
    areasCompared: string[];
  };
  marketIntelData?: {
    daysOnMarket: number;
    saleToListRatio: string;
    holdingCostPerDay: number;
    isLive: boolean;
  };
}

export interface ChipMeta {
  phase: number;
  mode: number;
  containment: boolean;
  bookingCtaShown?: boolean;
}

export interface ChatAction {
  label: string;
  href?: string;
  eventType?: string;
  actionType?: 'generate_report' | 'open_report' | 'priority_call';
  type?: string; 
  id?: string; 
  reportType?: 'net_sheet' | 'buyer_readiness' | 'cash_comparison' | 'home_value_preview';
  reportId?: string; 
  context?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  suggestedReplies?: MappedReply[];
  chipMeta?: ChipMeta;
  metadata?: {
    report_id?: string;
    report_type?: string;
    greeting_language?: 'en' | 'es';
  };
}

export interface ReportState {
  isOpen: boolean;
  isGenerating: boolean;
  title: string;
  markdown: string;
  reportId?: string;
  reportType?: string;
}

export type CalculatorAdvantage = 'cash' | 'traditional' | 'consult';
