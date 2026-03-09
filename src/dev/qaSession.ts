import { logger } from "@/lib/logger";

/**
 * QA Session Helper — DEV only
 * Forces a deterministic session_id for repeatable test runs.
 * Usage from console:
 *   import('/src/dev/qaSession.ts').then(m => m.setQaSession('test_sid_ui_happy_1'))
 */

const SESSION_KEY = 'selena_session_id';
const CONTEXT_KEY = 'selena_context_v2';
const QA_KEY = 'selena_qa_session_id';

/**
 * Set a deterministic session ID for QA.
 * Also updates the canonical session key so getOrCreateSessionId() returns it.
 */
export function setQaSession(id: string): void {
  localStorage.setItem(QA_KEY, id);
  localStorage.setItem(SESSION_KEY, id);

  // Patch context if it exists
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (raw) {
      const ctx = JSON.parse(raw);
      ctx.session_id = id;
      localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
    }
  } catch {
    // noop
  }

  logger.log(`[QA] Session ID set to: ${id}`);
}

/**
 * Get the current QA session ID (null if not set).
 */
export function getQaSessionId(): string | null {
  return localStorage.getItem(QA_KEY);
}

/**
 * Clear the QA session override — next page load uses a fresh random ID.
 */
export function clearQaSession(): void {
  localStorage.removeItem(QA_KEY);
  logger.log('[QA] QA session override cleared. Next load will generate a new session.');
}

/**
 * Full reset: clear QA override + wipe session context + session ID.
 * Use before a clean test run.
 */
export function resetAll(): void {
  localStorage.removeItem(QA_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CONTEXT_KEY);
  logger.log('[QA] All session data cleared.');
}

/**
 * Reset only seller-decision wizard keys in SessionContext.
 * Preserves session ID, UTMs, language, and lead identity.
 */
export function resetSellerDecisionContext(): void {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (!raw) {
      logger.log('[QA] No session context to reset.');
      return;
    }
    const ctx = JSON.parse(raw);

    // Null out seller-decision-specific keys
    const sellerKeys = [
      'seller_decision_step',
      'seller_decision_recommended_path',
      'seller_goal_priority',
      'property_condition_raw',
      'neighborhood_explored',
      'last_neighborhood_zip',
      'situation',
      'timeline',
      'condition',
    ];
    for (const key of sellerKeys) {
      delete ctx[key];
    }

    localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
    logger.log('[QA] Seller decision context keys cleared:', sellerKeys);
  } catch {
    logger.warn('[QA] Failed to reset seller decision context.');
  }
}
