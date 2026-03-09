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
  | 'neighborhood_detail';

export interface EntryContext {
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
