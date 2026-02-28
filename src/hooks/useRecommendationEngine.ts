/**
 * Recommendation Engine Hook
 * Rules-based algorithm for personalized guide recommendations
 */

import { useMemo } from 'react';
import { getGuidesRead, getIntent, getLastGuideId, type Guide, type Intent } from '@/lib/guides/personalization';
import { getSessionContext } from '@/lib/analytics/selenaSession';

export interface RecommendationSignals {
  language: 'en' | 'es';
  intent: Intent;
  guidesRead: string[];
  lastViewedCategory: string | null;
  sessionDuration: number;
}

export interface RankedGuide {
  guide: Guide;
  score: number;
  reasons: string[];
}

// Category weights by intent — uses exact category IDs from registry
const INTENT_CATEGORY_MAP: Record<string, string[]> = {
  buy: ['buying'],
  sell: ['selling', 'valuation'],
  cash: ['cash', 'selling'],
  explore: ['stories', 'buying', 'selling'],
};

// Situation-based guide mapping — only IDs that exist in registry
const SITUATION_GUIDE_MAP: Record<string, string[]> = {
  inherited: ['inherited-probate-property', 'cash-offer-guide'],
  relocating: ['selling-for-top-dollar', 'cash-offer-guide'],
  first_time: ['first-time-buyer-guide', 'first-time-buyer-story'],
  spanish_first: ['spanish-speaking-client-story'],
};

/**
 * Calculate recommendation score for a guide
 */
function calculateGuideScore(
  guide: Guide,
  signals: RecommendationSignals
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Intent alignment (+30 points max)
  if (signals.intent) {
    const relevantCategories = INTENT_CATEGORY_MAP[signals.intent] || [];
    if (relevantCategories.includes(guide.category)) {
      score += 30;
      reasons.push(`Matches ${signals.intent} intent`);
    }
  }

  // 2. Category continuity (+20 points)
  if (signals.lastViewedCategory && guide.category === signals.lastViewedCategory) {
    score += 20;
    reasons.push('Same category as last viewed');
  }

  // 3. Penalize already-read guides (-50 points)
  if (signals.guidesRead.includes(guide.id)) {
    score -= 50;
    reasons.push('Already read');
  }

  // 4. Featured guides get a boost (+15 points)
  if (guide.isFeatured) {
    score += 15;
    reasons.push('Featured');
  }

  // 5. New visitors - boost foundational guides (+25 points)
  if (signals.guidesRead.length === 0) {
    const foundationalGuides = ['first-time-buyer-guide', 'selling-for-top-dollar', 'understanding-home-valuation'];
    if (foundationalGuides.includes(guide.id)) {
      score += 25;
      reasons.push('Foundational for new visitors');
    }
  }

  // 6. Experienced visitors - boost advanced/comparison content (+15 points)
  if (signals.guidesRead.length >= 3) {
    const advancedGuides = ['cash-offer-guide', 'inherited-probate-property'];
    if (advancedGuides.includes(guide.id)) {
      score += 15;
      reasons.push('Advanced content for engaged users');
    }
  }

  // 7. Short read time for hesitant users (+10 points)
  if (signals.sessionDuration < 60 && guide.readTime.includes('5')) {
    score += 10;
    reasons.push('Quick read for new visitors');
  }

  // 8. Stories for trust-building (+10 points for new users)
  if (signals.guidesRead.length < 2 && guide.category === 'stories') {
    score += 10;
    reasons.push('Trust-building story');
  }

  return { score, reasons };
}

/**
 * Get current recommendation signals from session
 */
export function getRecommendationSignals(): RecommendationSignals {
  const context = getSessionContext();
  const intent = getIntent();
  const guidesRead = getGuidesRead();

  let sessionDuration = 0;
  if (context?.created_at && context?.last_seen_at) {
    const created = new Date(context.created_at).getTime();
    const lastSeen = new Date(context.last_seen_at).getTime();
    sessionDuration = Math.floor((lastSeen - created) / 1000);
  }

  return {
    language: context?.language || 'en',
    intent,
    guidesRead,
    lastViewedCategory: null,
    sessionDuration,
  };
}

/**
 * Hook to get personalized guide recommendations
 */
export function useRecommendationEngine(allGuides: Guide[]) {
  const signals = useMemo(() => {
    const base = getRecommendationSignals();
    
    const lastGuideId = getLastGuideId();
    if (lastGuideId) {
      const lastGuide = allGuides.find(g => g.id === lastGuideId);
      if (lastGuide) {
        base.lastViewedCategory = lastGuide.category;
      }
    }
    
    return base;
  }, [allGuides]);

  const rankedGuides = useMemo(() => {
    const ranked: RankedGuide[] = allGuides.map(guide => {
      const { score, reasons } = calculateGuideScore(guide, signals);
      return { guide, score, reasons };
    });

    return ranked.sort((a, b) => b.score - a.score);
  }, [allGuides, signals]);

  const topRecommendations = useMemo(() => {
    return rankedGuides
      .filter(r => r.score > 0 && !signals.guidesRead.includes(r.guide.id))
      .slice(0, 6);
  }, [rankedGuides, signals.guidesRead]);

  const getSituationGuides = (situation: string): Guide[] => {
    const guideIds = SITUATION_GUIDE_MAP[situation] || [];
    return guideIds
      .map(id => allGuides.find(g => g.id === id))
      .filter((g): g is Guide => g !== undefined);
  };

  return {
    signals,
    rankedGuides,
    topRecommendations,
    getSituationGuides,
    guidesReadCount: signals.guidesRead.length,
    hasEngaged: signals.guidesRead.length > 0,
  };
}
