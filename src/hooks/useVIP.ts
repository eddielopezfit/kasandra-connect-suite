/**
 * useVIP — React hook for the Visitor Intelligence Profile.
 * Builds VIP from local state immediately, then hydrates from server.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  buildVIPFromLocal,
  mergeServerData,
  selectBookingReadiness,
  selectFrictionScore,
  selectRecommendedNextStep,
  selectContinuationSummary,
  type VisitorIntelligenceProfile,
  type ServerProfileData,
} from '@/lib/vip';
import { supabase } from '@/integrations/supabase/client';

interface UseVIPOptions {
  /** Skip server hydration (useful for non-critical renders) */
  localOnly?: boolean;
}

export function useVIP(options: UseVIPOptions = {}) {
  const [vip, setVip] = useState<VisitorIntelligenceProfile>(() => buildVIPFromLocal());
  const [serverHydrated, setServerHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(!options.localOnly);

  // Server hydration
  useEffect(() => {
    if (options.localOnly) return;

    const sessionId = vip.identity.sessionId;
    const leadId = vip.identity.leadId;

    if (!sessionId && !leadId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      try {
        const serverData: ServerProfileData = {};

        // Fetch session snapshot + lead profile in parallel
        const body = { session_id: sessionId || undefined, lead_id: leadId || undefined };

        const [snapshotRes, conversationRes] = await Promise.all([
          supabase.functions.invoke('get-session-snapshot', { body }),
          supabase.functions.invoke('get-conversation', { body }),
        ]);

        if (snapshotRes.data?.snapshot) {
          serverData.sessionSnapshot = snapshotRes.data.snapshot;
        }

        // Extract persisted memory facts from conversation if available
        if (conversationRes.data?.conversation?.messages) {
          // Memory facts are extracted on the server side via selena-memory
          // For now, conversation data enriches turn count
        }

        if (cancelled) return;

        const merged = mergeServerData(buildVIPFromLocal(), serverData);
        setVip(merged);
        setServerHydrated(true);
      } catch (err) {
        console.warn('[VIP] Server hydration failed, using local-only:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh from local state (call after session context changes)
  const refresh = useCallback(() => {
    const fresh = buildVIPFromLocal();
    setVip(prev => {
      // Preserve server data if already hydrated
      if (serverHydrated) {
        return { ...prev, ...fresh, sources: [...new Set([...prev.sources, ...fresh.sources])] };
      }
      return fresh;
    });
  }, [serverHydrated]);

  // Derived selectors (memoized)
  const bookingReadiness = useMemo(() => selectBookingReadiness(vip), [vip]);
  const frictionScore = useMemo(() => selectFrictionScore(vip), [vip]);
  const recommendedNextStep = useMemo(() => selectRecommendedNextStep(vip), [vip]);
  const continuationSummary = useMemo(() => selectContinuationSummary(vip), [vip]);

  return {
    vip,
    isLoading,
    serverHydrated,
    refresh,
    // Selectors
    bookingReadiness,
    frictionScore,
    recommendedNextStep,
    continuationSummary,
  };
}
