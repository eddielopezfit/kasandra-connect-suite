/**
 * CTA Tracking Helper
 * Centralized function and constants to prevent naming drift in CTA tracking
 */

import { logEvent, EventType } from './logEvent';
import { Intent } from './selenaSession';

// ============ CTA Name Constants ============
// Use these constants to ensure consistent analytics naming

export const CTA_NAMES = {
  // Selena routing
  SELENA_ROUTE_CALL: 'cta_selena_route_call',
  
  // Hero CTAs
  HERO_BUYER_READINESS: 'hero_buyer_readiness',
  HERO_VALUATION_GUIDE: 'hero_valuation_guide',
  HERO_CASH_COMPARISON: 'hero_cash_comparison',
  HERO_SELLING_GUIDE: 'hero_selling_guide',
  
  // Ready-to-start CTAs
  READY_TO_START_READINESS: 'ready_to_start_readiness',
  
  // Traditional listing
  TRADITIONAL_LISTING_GUIDE: 'traditional_listing_guide',
  
  // Cash offer options
  CASH_OFFER_OPTIONS: 'cash_offer_options',
  
  // Thank you page CTAs
  THANK_YOU_PRIMARY: 'thank_you_primary',
  THANK_YOU_RESOURCE: 'thank_you_resource',
  THANK_YOU_SELENA_PROMPT: 'thank_you_selena_prompt',
  THANK_YOU_PHONE: 'thank_you_phone',
  
  // Tool/Calculator CTAs
  TOOL_PRIVATE_CASH_REVIEW: 'tool_private_cash_review',
  TOOL_ASK_SELENA: 'tool_ask_selena',
  TOOL_BOOK_CONSULTATION: 'tool_book_consultation',
  TOOL_SAVE_RESULTS: 'tool_save_results',
  
  // Buyer Readiness Results CTAs
  RESULT_CHAT_SELENA: 'cta_chat_with_selena',
  RESULT_TALK_KASANDRA: 'cta_talk_with_kasandra',
  RESULT_CONTINUE_EXPLORING: 'cta_continue_exploring',
} as const;

export type CTAName = typeof CTA_NAMES[keyof typeof CTA_NAMES];

// Valid CTA prefixes for runtime validation
const VALID_CTA_PREFIXES = [
  'hero_',
  'cta_',
  'ready_',
  'traditional_',
  'thank_you_',
  'tool_',
  'cash_',
  'result_',
] as const;

interface CTAClickParams {
  cta_name: string;
  destination: string;
  page_path: string;
  intent: Intent | string;
  [key: string]: unknown;
}

/**
 * Validate CTA name follows conventions (dev only)
 */
function validateCTAName(cta_name: string): void {
  if (import.meta.env.DEV) {
    const isValid = VALID_CTA_PREFIXES.some(prefix => cta_name.startsWith(prefix));
    if (!isValid) {
      console.warn(
        `[CTA Naming] Invalid CTA name "${cta_name}". ` +
        `Must start with one of: ${VALID_CTA_PREFIXES.join(', ')}`
      );
    }
  }
}

/**
 * Log a standardized CTA click event
 * Use this helper on orientation pages to maintain consistent tracking
 */
export function logCTAClick({ cta_name, destination, page_path, intent, ...extras }: CTAClickParams): void {
  validateCTAName(cta_name);
  
  logEvent('cta_click' as EventType, {
    cta_name,
    destination,
    page_path,
    intent,
    ...extras,
  });
}
