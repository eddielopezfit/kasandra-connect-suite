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
  THANK_YOU_GUIDES: 'thank_you_guides',
  THANK_YOU_BOOK: 'thank_you_book',
  
  // Tool CTAs
  TOOL_CALCULATOR_START: 'tool_calculator_start',
  TOOL_QUIZ_START: 'tool_quiz_start',
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
] as const;

interface CTAClickParams {
  cta_name: string;
  destination: string;
  page_path: string;
  intent: Intent;
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
