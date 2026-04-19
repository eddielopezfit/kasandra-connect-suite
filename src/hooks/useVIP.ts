/**
 * useVIP — React hook for the Visitor Intelligence Profile.
 * Delegates to the global VIPProvider context.
 * Falls back to standalone local-only build if used outside provider (rare).
 */

import { useMemo } from 'react';
import { VIPContext, type VIPContextValue } from '@/contexts/VIPContext';
import { useContext } from 'react';
import {
  buildVIPFromLocal,
  selectBookingReadiness,
  selectFrictionScore,
  selectRecommendedNextStep,
  selectContinuationSummary,
} from '@/lib/vip';

interface UseVIPOptions {
  /** Skip server hydration (no-op when using VIPProvider) */
  localOnly?: boolean;
}

export function useVIP(_options: UseVIPOptions = {}): VIPContextValue {
  // Hooks must always be called unconditionally — call both, then branch.
  const ctx = useContext(VIPContext);
  const fallbackVip = useMemo(() => buildVIPFromLocal(), []);

  if (ctx) return ctx;

  // Fallback for components rendered outside VIPProvider (shouldn't happen in prod)
  return {
    vip: fallbackVip,
    isLoading: false,
    serverHydrated: false,
    refresh: () => {},
    persist: () => {},
    bookingReadiness: selectBookingReadiness(fallbackVip),
    frictionScore: selectFrictionScore(fallbackVip),
    recommendedNextStep: selectRecommendedNextStep(fallbackVip),
    continuationSummary: selectContinuationSummary(fallbackVip),
  };
}
