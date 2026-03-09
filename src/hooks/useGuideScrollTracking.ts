/**
 * Guide Scroll Tracking Hook
 * Tracks scroll depth milestones (50%, 90%) for analytics
 * Fires each event only once per page view
 */

import { useEffect, useRef, useCallback } from 'react';
import { logEvent } from '@/lib/analytics/logEvent';
import { getIntent } from '@/lib/guides/personalization';
import { markGuideCompleted } from '@/lib/analytics/selenaSession';

interface UseGuideScrollTrackingOptions {
  guideId: string;
  guideTitle: string;
  enabled?: boolean;
}

export function useGuideScrollTracking({
  guideId,
  guideTitle,
  enabled = true,
}: UseGuideScrollTrackingOptions) {
  const fired50Ref = useRef(false);
  const fired90Ref = useRef(false);
  const lastScrollRef = useRef(0);

  const handleScroll = useCallback(() => {
    if (!enabled) return;

    // Calculate scroll depth
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return;
    
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Debounce: only check if scrolled more than 5%
    if (Math.abs(scrollPercent - lastScrollRef.current) < 5) return;
    lastScrollRef.current = scrollPercent;

    const intent = getIntent();
    const basePayload = {
      guide_id: guideId,
      guide_title: guideTitle,
      intent: intent || 'unknown',
    };

    // Fire 50% milestone — also marks guide as completed for journey awareness
    if (scrollPercent >= 50 && !fired50Ref.current) {
      fired50Ref.current = true;
      logEvent('guide_scroll_50', {
        ...basePayload,
        scroll_depth: 50,
      });
      // FIX 2: Mark guide as completed for Selena journey awareness
      markGuideCompleted(guideId);
    }

    // Fire 90% milestone (guide_complete)
    if (scrollPercent >= 90 && !fired90Ref.current) {
      fired90Ref.current = true;
      logEvent('guide_complete', {
        ...basePayload,
        scroll_depth: 90,
      });
    }
  }, [enabled, guideId, guideTitle]);

  useEffect(() => {
    if (!enabled) return;

    // Reset refs on mount (new page view)
    fired50Ref.current = false;
    fired90Ref.current = false;
    lastScrollRef.current = 0;

    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleScroll, guideId]);

  // Return current milestone status for debugging
  return {
    fired50: fired50Ref.current,
    fired90: fired90Ref.current,
  };
}
