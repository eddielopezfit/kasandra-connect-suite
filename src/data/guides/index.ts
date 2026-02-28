/**
 * Guide Data Loaders — lazy-loaded to keep the main bundle lean.
 * Each guide file exports a default GuideContentData object.
 * 
 * NO barrel re-exports — only dynamic import functions.
 */

import type { GuideContentData } from './types';
export type { GuideContentData };

export const GUIDE_DATA_LOADERS: Record<string, () => Promise<{ default: GuideContentData }>> = {
  'first-time-buyer-guide': () => import('./first-time-buyer-guide'),
  'selling-for-top-dollar': () => import('./selling-for-top-dollar'),
  'understanding-home-valuation': () => import('./understanding-home-valuation'),
  'cash-offer-guide': () => import('./cash-offer-guide'),
  'inherited-probate-property': () => import('./inherited-probate-property'),
  'first-time-buyer-story': () => import('./first-time-buyer-story'),
  'budget-buyer-story': () => import('./budget-buyer-story'),
  'seller-stressful-market-story': () => import('./seller-stressful-market-story'),
  'spanish-speaking-client-story': () => import('./spanish-speaking-client-story'),
  'cash-vs-traditional-sale': () => import('./cash-vs-traditional-sale'),
  'sell-now-or-wait': () => import('./sell-now-or-wait'),
  'life-change-selling': () => import('./life-change-selling'),
};
