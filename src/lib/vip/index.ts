/**
 * VIP — Visitor Intelligence Profile
 * Public API for the canonical profile system.
 */

export type {
  VisitorIntelligenceProfile,
  VIPIdentity,
  VIPAttribution,
  VIPIntent,
  VIPFinancial,
  VIPJourney,
  VIPMemory,
  VIPSource,
  CanonicalIntent,
  CanonicalTimeline,
} from './types';

export { buildVIPFromLocal, mergeServerData } from './builder';
export type { ServerProfileData } from './builder';

export {
  selectBookingReadiness,
  selectFrictionScore,
  selectRecommendedNextStep,
  selectContinuationSummary,
} from './selectors';
export type {
  BookingReadiness,
  RecommendedNextStep,
  ContinuationSummary,
} from './selectors';
