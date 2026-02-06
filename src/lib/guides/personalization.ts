/**
 * Guides Personalization - Session-based localStorage tracking
 * No backend/database required - purely client-side
 */

import { getSessionContext, updateSessionContext } from '@/lib/analytics/selenaSession';

const GUIDES_READ_KEY = 'cc_guides_read';
const LAST_GUIDE_KEY = 'cc_last_guide_id';
const INTENT_KEY = 'cc_intent';
const JOURNEY_ACTIONS_KEY = 'cc_journey_actions';

export type BadgeType = 'recommended' | 'next_best_step' | 'start_here' | 'continue' | 'popular_buyers' | 'popular_sellers' | 'read';
export type Intent = 'buy' | 'sell' | 'cash' | 'explore' | null;
export type JourneyStage = 1 | 2 | 3 | 4 | 5;

export interface Guide {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  category: string;
  readTime: string;
  readTimeEs: string;
  isFeatured?: boolean;
}

export interface RecommendedGuide {
  guide: Guide;
  badgeType: BadgeType;
}

// Define foundational "start here" guides per category
const START_HERE_GUIDES = ['first-time-buyer-guide', 'selling-for-top-dollar', 'understanding-home-valuation'];

// Map categories to intents
const CATEGORY_INTENT_MAP: Record<string, Intent> = {
  buying: 'buy',
  selling: 'sell',
  valuation: 'sell',
  financial: 'buy',
  neighborhoods: 'buy',
  stories: null,
  tips: null,
};

// Buyer-focused categories
const BUYER_CATEGORIES = ['buying', 'financial', 'neighborhoods'];
// Seller-focused categories  
const SELLER_CATEGORIES = ['selling', 'valuation'];

/**
 * Get list of guide IDs the user has read
 */
export function getGuidesRead(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(GUIDES_READ_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a guide as read
 */
export function markGuideRead(guideId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getGuidesRead();
    if (!current.includes(guideId)) {
      current.push(guideId);
      localStorage.setItem(GUIDES_READ_KEY, JSON.stringify(current));
    }
    // Also update session context
    updateSessionContext({ last_guide_id: guideId });
  } catch (e) {
    console.warn('[Guides] Failed to mark guide read:', e);
  }
}

/**
 * Get the last guide ID the user was viewing
 */
export function getLastGuideId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_GUIDE_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the last guide ID
 */
export function setLastGuideId(guideId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_GUIDE_KEY, guideId);
    updateSessionContext({ last_guide_id: guideId });
  } catch (e) {
    console.warn('[Guides] Failed to set last guide:', e);
  }
}

/**
 * Get user intent from session context or localStorage
 */
export function getIntent(): Intent {
  if (typeof window === 'undefined') return null;
  
  // First try session context
  const context = getSessionContext();
  if (context?.intent) {
    const intentMap: Record<string, Intent> = {
      buy: 'buy',
      sell: 'sell',
      cash: 'cash', // Canonical value (session context already normalized)
      explore: 'explore',
      investor: 'explore',
    };
    return intentMap[context.intent] || null;
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(INTENT_KEY);
    if (stored && ['buy', 'sell', 'cash', 'explore'].includes(stored)) {
      return stored as Intent;
    }
  } catch {
    // Ignore
  }
  
  return null;
}

/**
 * Set user intent
 */
export function setIntent(intent: Intent): void {
  if (typeof window === 'undefined' || !intent) return;
  try {
    localStorage.setItem(INTENT_KEY, intent);
    // Intent values are now canonical - 'cash' is used directly
    updateSessionContext({ intent: intent as 'buy' | 'sell' | 'cash' | 'explore' });
  } catch (e) {
    console.warn('[Guides] Failed to set intent:', e);
  }
}

/**
 * Track journey actions (book consultation, talk to kasandra, view report, use calculator)
 */
export function trackJourneyAction(action: 'book' | 'talk' | 'report' | 'calculator'): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(JOURNEY_ACTIONS_KEY);
    const actions: string[] = stored ? JSON.parse(stored) : [];
    if (!actions.includes(action)) {
      actions.push(action);
      localStorage.setItem(JOURNEY_ACTIONS_KEY, JSON.stringify(actions));
    }
  } catch (e) {
    console.warn('[Guides] Failed to track journey action:', e);
  }
}

/**
 * Get journey actions
 */
function getJourneyActions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(JOURNEY_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate journey stage (1-5)
 * 1 = Just starting (0 guides read)
 * 2 = Exploring (1-2 guides read)
 * 3 = Building clarity (3+ guides read)
 * 4 = Narrowing down (intent exists)
 * 5 = Ready to talk (clicked book/talk/report)
 */
export function getJourneyStage(): JourneyStage {
  const guidesRead = getGuidesRead();
  const intent = getIntent();
  const journeyActions = getJourneyActions();
  
  // Stage 5: User has clicked high-intent CTAs
  if (journeyActions.length > 0) {
    return 5;
  }
  
  // Stage 4: Intent is known
  if (intent) {
    return 4;
  }
  
  // Stage 3: 3+ guides read
  if (guidesRead.length >= 3) {
    return 3;
  }
  
  // Stage 2: 1-2 guides read
  if (guidesRead.length >= 1) {
    return 2;
  }
  
  // Stage 1: Just starting
  return 1;
}

/**
 * Check if user is returning (has read at least one guide or has last guide)
 */
export function isReturningVisitor(): boolean {
  return getGuidesRead().length > 0 || getLastGuideId() !== null;
}

/**
 * Get recommended guides with badges
 * Returns up to 8 guides with appropriate badges
 */
export function getRecommendedGuides(allGuides: Guide[]): RecommendedGuide[] {
  const guidesRead = getGuidesRead();
  const lastGuideId = getLastGuideId();
  const intent = getIntent();
  
  const recommended: RecommendedGuide[] = [];
  const usedIds = new Set<string>();
  
  // Helper to add guide with badge if not already used
  const addGuide = (guideId: string, badgeType: BadgeType) => {
    if (usedIds.has(guideId)) return;
    const guide = allGuides.find(g => g.id === guideId);
    if (guide) {
      recommended.push({ guide, badgeType });
      usedIds.add(guideId);
    }
  };
  
  // 1. Continue reading (if last guide exists and not fully read conceptually)
  if (lastGuideId) {
    addGuide(lastGuideId, 'continue');
  }
  
  // 2. If no guides read, add "Start Here" foundational guides
  if (guidesRead.length === 0) {
    START_HERE_GUIDES.forEach(id => addGuide(id, 'start_here'));
  }
  
  // 3. Intent-based recommendations
  if (intent === 'buy') {
    allGuides
      .filter(g => BUYER_CATEGORIES.includes(g.category) && !guidesRead.includes(g.id))
      .slice(0, 3)
      .forEach(g => addGuide(g.id, 'popular_buyers'));
  } else if (intent === 'sell' || intent === 'cash') {
    allGuides
      .filter(g => SELLER_CATEGORIES.includes(g.category) && !guidesRead.includes(g.id))
      .slice(0, 3)
      .forEach(g => addGuide(g.id, 'popular_sellers'));
  }
  
  // 4. Next best step: Same category as last guide
  if (lastGuideId) {
    const lastGuide = allGuides.find(g => g.id === lastGuideId);
    if (lastGuide) {
      allGuides
        .filter(g => g.category === lastGuide.category && g.id !== lastGuideId && !guidesRead.includes(g.id))
        .slice(0, 2)
        .forEach(g => addGuide(g.id, 'next_best_step'));
    }
  }
  
  // 5. Fill remaining with recommended (unread guides prioritized)
  allGuides
    .filter(g => !guidesRead.includes(g.id) && !usedIds.has(g.id))
    .slice(0, 8 - recommended.length)
    .forEach(g => addGuide(g.id, 'recommended'));
  
  return recommended.slice(0, 8);
}

/**
 * Get badge for a guide in the main grid
 * Returns null if no badge should be shown
 */
export function getGridBadge(guideId: string, guideCategory: string): BadgeType | null {
  const lastGuideId = getLastGuideId();
  const guidesRead = getGuidesRead();
  const intent = getIntent();
  
  // Continue badge for last guide
  if (guideId === lastGuideId) {
    return 'continue';
  }
  
  // Read indicator (subtle)
  if (guidesRead.includes(guideId)) {
    return 'read';
  }
  
  // Popular with buyers/sellers based on intent and category
  if (intent === 'buy' && BUYER_CATEGORIES.includes(guideCategory) && !guidesRead.includes(guideId)) {
    return 'popular_buyers';
  }
  
  if ((intent === 'sell' || intent === 'cash') && SELLER_CATEGORIES.includes(guideCategory) && !guidesRead.includes(guideId)) {
    return 'popular_sellers';
  }
  
  return null;
}
