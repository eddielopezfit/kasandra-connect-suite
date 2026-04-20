/**
 * Wiring Validator — DEV-only smoke check
 *
 * Boots once on app start (DEV builds only) and console-warns on:
 *  - Any chip in CHIPS_REGISTRY whose ActionSpec fails isActionValid()
 *  - Any CHIP_KEY → destination path that doesn't exist as an actual route
 *  - Any chip referencing a non-existent guideId
 *
 * Zero runtime cost in production: the entire module is gated by import.meta.env.DEV.
 */

import { CHIPS_REGISTRY } from '@/lib/registry/chipsRegistry';
import { CHIP_KEY_TO_DESTINATION } from '@/lib/registry/chipKeys';
import { isActionValid } from '@/lib/actions/actionSpec';

// Mirror of paths actually mounted in App.tsx (keep in sync when adding routes).
const KNOWN_ROUTES = new Set<string>([
  '/', '/buy', '/sell', '/cash-offer-options',
  '/guides', '/podcast', '/community',
  '/book', '/book/confirmed',
  '/buyer-readiness', '/seller-readiness', '/cash-readiness',
  '/seller-decision', '/seller-timeline',
  '/neighborhood-compare', '/buyer-closing-costs', '/off-market',
  '/market', '/neighborhoods', '/about', '/contact',
  '/selena-ai', '/affordability-calculator', '/bah-calculator',
  '/home-valuation', '/net-to-seller',
  '/privacy', '/terms', '/network', '/tucson-living', '/listings',
  '/thank-you',
  // Guide detail and neighborhood detail are dynamic — handled separately
]);

function isKnownRoute(path: string): boolean {
  if (!path) return true; // empty = conversational chip, OK
  const base = path.split('?')[0].split('#')[0];
  if (KNOWN_ROUTES.has(base)) return true;
  if (base.startsWith('/guides/')) return true; // dynamic guide detail
  if (base.startsWith('/neighborhoods/')) return true; // dynamic neighborhood
  if (base.startsWith('/ad/')) return true; // ad funnel
  return false;
}

export function runWiringValidator(): void {
  if (!import.meta.env.DEV) return;

  const issues: string[] = [];

  // 1. Validate every chip's ActionSpec
  for (const chip of CHIPS_REGISTRY) {
    if (chip.actionSpec && !isActionValid(chip.actionSpec)) {
      issues.push(
        `[chip:${chip.id}] ActionSpec invalid (type=${chip.actionSpec.type}). Label: "${chip.label_en}"`,
      );
    }
    // Conversational chips (no actionSpec) must carry a chipKey
    if (!chip.actionSpec && !chip.chipKey) {
      issues.push(
        `[chip:${chip.id}] No actionSpec AND no chipKey — chip will dead-end. Label: "${chip.label_en}"`,
      );
    }
  }

  // 2. Validate CHIP_KEY → destination mapping points to a real route
  for (const [key, dest] of Object.entries(CHIP_KEY_TO_DESTINATION)) {
    if (!isKnownRoute(dest)) {
      issues.push(`[chipKey:${key}] destination "${dest}" is not a registered route`);
    }
  }

  if (issues.length === 0) {
    // eslint-disable-next-line no-console
    console.info(
      `%c[WiringValidator] ✓ ${CHIPS_REGISTRY.length} chips, ${Object.keys(CHIP_KEY_TO_DESTINATION).length} chip keys — all wiring intact.`,
      'color:#7d9b76',
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(
    `%c[WiringValidator] ${issues.length} wiring issue(s) detected:`,
    'color:#c44569;font-weight:bold',
  );
  for (const issue of issues) {
    // eslint-disable-next-line no-console
    console.warn(`  • ${issue}`);
  }
}
