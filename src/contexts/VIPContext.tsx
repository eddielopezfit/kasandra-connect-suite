/**
 * VIPProvider — Global Visitor Intelligence Profile context.
 * Single VIP instance shared across all components.
 * Eliminates duplicate useVIP() calls and ensures consistent state timing.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  buildVIPFromLocal,
  mergeServerData,
  selectBookingReadiness,
  selectFrictionScore,
  selectRecommendedNextStep,
  selectContinuationSummary,
  type VisitorIntelligenceProfile,
  type ServerProfileData,
  type BookingReadiness,
  type RecommendedNextStep,
  type ContinuationSummary,
} from '@/lib/vip';
import { supabase } from '@/integrations/supabase/client';
import { saveSnapshot } from '@/lib/analytics/sessionSnapshot';

interface VIPContextValue {
  vip: VisitorIntelligenceProfile;
  isLoading: boolean;
  serverHydrated: boolean;
  /** Refresh VIP from local state (call after tool completion, booking, etc.) */
  refresh: () => void;
  /** Trigger a write-back to the server snapshot */
  persist: () => void;
  // Selectors
  bookingReadiness: BookingReadiness;
  frictionScore: number;
  recommendedNextStep: RecommendedNextStep;
  continuationSummary: ContinuationSummary;
}

const VIPCtx = createContext<VIPContextValue | null>(null);

export function VIPProvider({ children }: { children: ReactNode }) {
  const [vip, setVip] = useState<VisitorIntelligenceProfile>(() => buildVIPFromLocal());
  const [serverHydrated, setServerHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Server hydration (once)
  useEffect(() => {
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
        const body = { session_id: sessionId || undefined, lead_id: leadId || undefined };

        const [snapshotRes, conversationRes] = await Promise.all([
          supabase.functions.invoke('get-session-snapshot', { body }),
          supabase.functions.invoke('get-conversation', { body }),
        ]);

        if (snapshotRes.data?.snapshot) {
          serverData.sessionSnapshot = snapshotRes.data.snapshot;
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

  // Refresh from local state (preserves server data if hydrated)
  const refresh = useCallback(() => {
    const fresh = buildVIPFromLocal();
    setVip(prev => {
      if (serverHydrated) {
        return { ...prev, ...fresh, sources: [...new Set([...prev.sources, ...fresh.sources])] };
      }
      return fresh;
    });
  }, [serverHydrated]);

  // Write-back to server (debounced via saveSnapshot)
  const persist = useCallback(() => {
    saveSnapshot();
  }, []);

  // Memoized selectors
  const bookingReadiness = useMemo(() => selectBookingReadiness(vip), [vip]);
  const frictionScore = useMemo(() => selectFrictionScore(vip), [vip]);
  const recommendedNextStep = useMemo(() => selectRecommendedNextStep(vip), [vip]);
  const continuationSummary = useMemo(() => selectContinuationSummary(vip), [vip]);

  const value = useMemo<VIPContextValue>(() => ({
    vip,
    isLoading,
    serverHydrated,
    refresh,
    persist,
    bookingReadiness,
    frictionScore,
    recommendedNextStep,
    continuationSummary,
  }), [vip, isLoading, serverHydrated, refresh, persist, bookingReadiness, frictionScore, recommendedNextStep, continuationSummary]);

  return <VIPCtx.Provider value={value}>{children}</VIPCtx.Provider>;
}

/**
 * useVIPContext — consume the global VIP provider.
 * Throws if used outside VIPProvider.
 */
export function useVIPContext(): VIPContextValue {
  const ctx = useContext(VIPCtx);
  if (!ctx) throw new Error('useVIPContext must be used within VIPProvider');
  return ctx;
}
