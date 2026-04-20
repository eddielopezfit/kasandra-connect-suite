/**
 * Route Preloader — maps pathname → dynamic-import factory so we can warm the
 * lazy chunk on link hover/focus. Each entry mirrors the lazy() call in App.tsx.
 *
 * Usage:
 *   <Link onMouseEnter={() => preloadRoute('/buy')} ... />
 *
 * Idempotent: dynamic imports are cached by the browser/Vite, so repeat calls
 * are no-ops after the first prefetch.
 */
const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/v2/V2Home"),
  "/buy": () => import("@/pages/v2/V2Buy"),
  "/sell": () => import("@/pages/v2/V2Sell"),
  "/cash-offer-options": () => import("@/pages/v2/V2CashOfferOptions"),
  "/guides": () => import("@/pages/v2/V2Guides"),
  "/podcast": () => import("@/pages/v2/V2Podcast"),
  "/community": () => import("@/pages/v2/V2Community"),
  "/book": () => import("@/pages/v2/V2Book"),
  "/buyer-readiness": () => import("@/pages/v2/V2BuyerReadiness"),
  "/seller-decision": () => import("@/pages/v2/V2SellerDecision"),
  "/seller-timeline": () => import("@/pages/v2/V2SellerTimeline"),
  "/seller-readiness": () => import("@/pages/v2/V2SellerReadiness"),
  "/cash-readiness": () => import("@/pages/v2/V2CashReadiness"),
  "/market": () => import("@/pages/v2/V2MarketIntelligence"),
  "/neighborhood-compare": () => import("@/pages/v2/V2NeighborhoodCompare"),
  "/neighborhoods": () => import("@/pages/v2/V2Neighborhoods"),
  "/about": () => import("@/pages/v2/V2About"),
  "/contact": () => import("@/pages/v2/V2Contact"),
  "/selena-ai": () => import("@/pages/v2/V2SelenaAI"),
  "/affordability-calculator": () => import("@/pages/v2/V2AffordabilityCalculator"),
  "/bah-calculator": () => import("@/pages/v2/V2BAHCalculator"),
  "/home-valuation": () => import("@/pages/v2/V2HomeValuation"),
  "/net-to-seller": () => import("@/pages/v2/V2NetToSeller"),
  "/network": () => import("@/pages/v2/V2TrustedNetwork"),
  "/tucson-living": () => import("@/pages/v2/V2TucsonLiving"),
  "/listings": () => import("@/pages/v2/V2Listings"),
  "/off-market": () => import("@/pages/v2/V2OffMarketBuyer"),
  "/buyer-closing-costs": () => import("@/pages/v2/V2BuyerClosingCosts"),
  "/privacy": () => import("@/pages/v2/V2Privacy"),
  "/terms": () => import("@/pages/v2/V2Terms"),
};

const warmed = new Set<string>();

export function preloadRoute(path: string) {
  if (warmed.has(path)) return;
  const loader = ROUTE_LOADERS[path];
  if (!loader) return;
  warmed.add(path);
  // Fire-and-forget; swallow errors (will retry on real navigation)
  loader().catch(() => warmed.delete(path));
}
