import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { updateSessionContext, getSessionContext, type SessionContext } from '@/lib/analytics/selenaSession';
import { logEvent } from '@/lib/analytics/logEvent';

type EnrichedContext = SessionContext & {
  pages_viewed?: string[];
  scroll_depth?: number;
  time_on_site?: number;
};

/**
 * Lightweight session enrichment hook:
 * - Tracks pages_viewed (deduplicated)
 * - Tracks scroll_depth (debounced, max per page)
 * - Tracks time_on_site (incremental, every 30s)
 * - Fires intent_detected / intent_updated analytics events
 */
export function useSessionEnrichment() {
  const location = useLocation();
  const scrollDepthRef = useRef(0);
  const prevIntentRef = useRef<string | undefined>();

  // Track page views in context
  useEffect(() => {
    const ctx = getSessionContext() as EnrichedContext | null;
    if (!ctx) return;

    const currentPages: string[] = ctx.pages_viewed ?? [];
    const path = location.pathname;
    if (!currentPages.includes(path)) {
      updateSessionContext({ pages_viewed: [...currentPages, path] } as Partial<SessionContext>);
    }

    // Detect intent changes
    const currentIntent = ctx.intent;
    if (currentIntent && currentIntent !== prevIntentRef.current) {
      const eventType = (prevIntentRef.current ? 'intent_updated' : 'intent_detected') as Parameters<typeof logEvent>[0];
      logEvent(eventType, {
        intent: currentIntent,
        previous_intent: prevIntentRef.current || 'none',
        page: path,
      });
      prevIntentRef.current = currentIntent;
    } else if (!prevIntentRef.current && currentIntent) {
      prevIntentRef.current = currentIntent;
    }
  }, [location.pathname]);

  // Scroll depth tracking (debounced)
  useEffect(() => {
    scrollDepthRef.current = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) { ticking = false; return; }
        const depth = Math.round((window.scrollY / scrollHeight) * 100);
        if (depth > scrollDepthRef.current) {
          scrollDepthRef.current = depth;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Persist max scroll depth on page leave
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollDepthRef.current > 0) {
        updateSessionContext({ scroll_depth: scrollDepthRef.current } as Partial<SessionContext>);
      }
    };
  }, [location.pathname]);

  // Time on site (increment every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const ctx = getSessionContext() as EnrichedContext | null;
      if (!ctx) return;
      const current = ctx.time_on_site ?? 0;
      updateSessionContext({ time_on_site: current + 30 } as Partial<SessionContext>);
    }, 30_000);

    return () => clearInterval(interval);
  }, []);
}
