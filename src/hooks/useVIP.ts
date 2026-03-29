/**
 * useVIP — React hook for the Visitor Intelligence Profile.
 * Delegates to the global VIPProvider context.
 * Falls back to standalone local-only build if used outside provider (rare).
 */

import { useMemo } from 'react';
import { useVIPContext } from '@/contexts/VIPContext';
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

export function useVIP(_options: UseVIPOptions = {}) {
  // Try global context first
  try {
    const ctx = useVIPContext();
    return ctx;
  } catch {
    // Fallback for components rendered outside VIPProvider (shouldn't happen in prod)
    const vip = useMemo(() => buildVIPFromLocal(), []);
    return {
      vip,
      isLoading: false,
      serverHydrated: false,
      refresh: () => {},
      persist: () => {},
      bookingReadiness: selectBookingReadiness(vip),
      frictionScore: selectFrictionScore(vip),
      recommendedNextStep: selectRecommendedNextStep(vip),
      continuationSummary: selectContinuationSummary(vip),
    };
  }
}
