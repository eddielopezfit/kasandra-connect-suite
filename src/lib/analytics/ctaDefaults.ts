/**
 * CTA Tracking Helper
 * Centralized function to prevent copy-paste drift in CTA tracking
 */

import { logEvent, EventType } from './logEvent';
import { Intent } from './selenaSession';

interface CTAClickParams {
  cta_name: string;
  destination: string;
  page_path: string;
  intent: Intent;
  [key: string]: unknown;
}

/**
 * Log a standardized CTA click event
 * Use this helper on orientation pages to maintain consistent tracking
 */
export function logCTAClick({ cta_name, destination, page_path, intent, ...extras }: CTAClickParams): void {
  logEvent('cta_click' as EventType, {
    cta_name,
    destination,
    page_path,
    intent,
    ...extras,
  });
}
