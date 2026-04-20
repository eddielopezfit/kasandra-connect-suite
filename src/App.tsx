import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollManager from "@/components/ScrollManager";

// Lazy-load VIPProvider — its selectors, snapshot writer, and CRM sync
// are not needed for first paint. Until it hydrates, render children
// passthrough so the tree mounts without blocking.
const VIPProvider = lazy(() =>
  import("@/contexts/VIPContext").then((m) => ({ default: m.VIPProvider }))
);
const VIPProviderPassthrough = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<>{children}</>}>
    <VIPProvider>{children}</VIPProvider>
  </Suspense>
);
import RouteAnalytics from "@/components/RouteAnalytics";
import NotFound from "./pages/NotFound";
import { initQaAccess } from "@/lib/qa/qaAccess";

const V2Redirect = () => {
  const location = useLocation();
  const newPath = location.pathname.replace(/^\/v2/, '') || '/';
  return <Navigate to={newPath + location.search} replace />;
};

// Route-level lazy imports
const V2Home = lazy(() => import("./pages/v2/V2Home"));
const V2Buy = lazy(() => import("./pages/v2/V2Buy"));
const V2Sell = lazy(() => import("./pages/v2/V2Sell"));
const V2CashOfferOptions = lazy(() => import("./pages/v2/V2CashOfferOptions"));
const V2Guides = lazy(() => import("./pages/v2/V2Guides"));
const V2GuideDetail = lazy(() => import("./pages/v2/V2GuideDetail"));
const V2Podcast = lazy(() => import("./pages/v2/V2Podcast"));
const V2Community = lazy(() => import("./pages/v2/V2Community"));
const V2Book = lazy(() => import("./pages/v2/V2Book"));
const V2BookConfirmed = lazy(() => import("./pages/v2/V2BookConfirmed"));
const V2BuyerReadiness = lazy(() => import("./pages/v2/V2BuyerReadiness"));

const V2ThankYou = lazy(() => import("./pages/v2/V2ThankYou"));
const V2SellerDecision = lazy(() => import("./pages/v2/V2SellerDecision"));
const V2SellerTimeline = lazy(() => import("./pages/v2/V2SellerTimeline"));
const V2SellerReadiness = lazy(() => import("./pages/v2/V2SellerReadiness"));
const V2CashReadiness = lazy(() => import("./pages/v2/V2CashReadiness"));
const V2MarketIntelligence = lazy(() => import("./pages/v2/V2MarketIntelligence"));
const V2NeighborhoodCompare = lazy(() => import("./pages/v2/V2NeighborhoodCompare"));
const V2BuyerClosingCosts = lazy(() => import("./pages/v2/V2BuyerClosingCosts"));
const V2CTAQualityAssurance = lazy(() => import("./pages/v2/V2CTAQualityAssurance"));
const V2QADeterminism = lazy(() => import("./pages/v2/V2QADeterminism"));
const V2QAToneSuite = lazy(() => import("./pages/v2/V2QAToneSuite"));
const V2Neighborhoods = lazy(() => import("./pages/v2/V2Neighborhoods"));
const V2NeighborhoodDetail = lazy(() => import("./pages/v2/V2NeighborhoodDetail"));
const V2OffMarketBuyer = lazy(() => import("./pages/v2/V2OffMarketBuyer"));
const V2About = lazy(() => import("./pages/v2/V2About"));
const V2Contact = lazy(() => import("./pages/v2/V2Contact"));
const V2Privacy = lazy(() => import("./pages/v2/V2Privacy"));
const V2Terms = lazy(() => import("./pages/v2/V2Terms"));
const V2TrustedNetwork = lazy(() => import("./pages/v2/V2TrustedNetwork"));
const V2TucsonLiving = lazy(() => import("./pages/v2/V2TucsonLiving"));
const V2SelenaAI = lazy(() => import("./pages/v2/V2SelenaAI"));
const V2AffordabilityCalculator = lazy(() => import("./pages/v2/V2AffordabilityCalculator"));
const V2BAHCalculator = lazy(() => import("./pages/v2/V2BAHCalculator"));
const V2HomeValuation = lazy(() => import("./pages/v2/V2HomeValuation"));
const V2NetToSeller = lazy(() => import("./pages/v2/V2NetToSeller"));
const SellerLanding = lazy(() => import("./pages/ad/SellerLanding"));
const SellerQuiz = lazy(() => import("./pages/ad/SellerQuiz"));
const SellerResult = lazy(() => import("./pages/ad/SellerResult"));
const V2Listings = lazy(() => import("./pages/v2/V2Listings"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background">
    {/* Nav skeleton */}
    <div className="h-16 border-b border-border/40 flex items-center px-4 gap-4">
      <div className="w-32 h-6 rounded bg-muted animate-pulse" />
      <div className="flex-1" />
      <div className="w-20 h-8 rounded-full bg-muted animate-pulse" />
    </div>
    {/* Hero skeleton */}
    <div className="px-4 pt-10 pb-6 space-y-4 max-w-2xl mx-auto">
      <div className="w-3/4 h-8 rounded bg-muted animate-pulse" />
      <div className="w-full h-5 rounded bg-muted animate-pulse" />
      <div className="w-2/3 h-5 rounded bg-muted animate-pulse" />
      <div className="w-40 h-12 rounded-full bg-muted animate-pulse mt-6" />
    </div>
    {/* Content skeleton */}
    <div className="px-4 space-y-3 max-w-2xl mx-auto">
      <div className="w-full h-28 rounded-xl bg-muted animate-pulse" />
      <div className="w-full h-28 rounded-xl bg-muted animate-pulse" />
    </div>
  </div>
);

const App = () => {
  useEffect(() => {
    initQaAccess();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <VIPProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollManager />
            <RouteAnalytics />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Legacy redirects */}
                <Route path="/v2" element={<Navigate to="/" replace />} />
                <Route path="/v2/*" element={<V2Redirect />} />
                <Route path="/cash-offer" element={<Navigate to="/cash-offer-options" replace />} />
                <Route path="/cash-options" element={<Navigate to="/cash-offer-options" replace />} />
                <Route path="/corner-connect" element={<Navigate to="/sell" replace />} />
                <Route path="/explore" element={<Navigate to="/guides" replace />} />
                <Route path="/market-intelligence" element={<Navigate to="/market" replace />} />
                <Route path="/podcast/episodes" element={<Navigate to="/podcast" replace />} />

                {/* Canonical Routes */}
                <Route path="/" element={<V2Home />} />
                <Route path="/buy" element={<V2Buy />} />
                <Route path="/sell" element={<V2Sell />} />
                <Route path="/cash-offer-options" element={<V2CashOfferOptions />} />
                <Route path="/guides" element={<V2Guides />} />
                <Route path="/guides/:guideId" element={<V2GuideDetail />} />
                <Route path="/podcast" element={<V2Podcast />} />
                <Route path="/community" element={<V2Community />} />
                <Route path="/book" element={<V2Book />} />
                <Route path="/book/confirmed" element={<V2BookConfirmed />} />
                <Route path="/buyer-readiness" element={<V2BuyerReadiness />} />
                <Route path="/private-cash-review" element={<Navigate to="/cash-offer-options" replace />} />
                <Route path="/thank-you" element={<V2ThankYou />} />
                <Route path="/seller-decision" element={<V2SellerDecision />} />
                <Route path="/seller-timeline" element={<V2SellerTimeline />} />
                <Route path="/seller-readiness" element={<V2SellerReadiness />} />
                <Route path="/cash-readiness" element={<V2CashReadiness />} />
                <Route path="/off-market" element={<V2OffMarketBuyer />} />
                <Route path="/market" element={<V2MarketIntelligence />} />
                <Route path="/neighborhood-compare" element={<V2NeighborhoodCompare />} />
                <Route path="/buyer-closing-costs" element={<V2BuyerClosingCosts />} />
                <Route path="/qa-cta" element={import.meta.env.DEV ? <V2CTAQualityAssurance /> : <Navigate to="/" replace />} />
                <Route path="/qa-determinism" element={import.meta.env.DEV ? <V2QADeterminism /> : <Navigate to="/" replace />} />
                <Route path="/qa-tone-suite" element={<V2QAToneSuite />} />
                <Route path="/neighborhoods" element={<V2Neighborhoods />} />
                <Route path="/neighborhoods/:slug" element={<V2NeighborhoodDetail />} />
                <Route path="/about" element={<V2About />} />
                <Route path="/contact" element={<V2Contact />} />
                <Route path="/selena-ai" element={<V2SelenaAI />} />
                <Route path="/affordability-calculator" element={<V2AffordabilityCalculator />} />
                <Route path="/bah-calculator" element={<V2BAHCalculator />} />
                <Route path="/home-valuation" element={<V2HomeValuation />} />
                <Route path="/net-to-seller" element={<V2NetToSeller />} />
                <Route path="/privacy" element={<V2Privacy />} />
                <Route path="/terms" element={<V2Terms />} />
                <Route path="/network" element={<V2TrustedNetwork />} />
                <Route path="/tucson-living" element={<V2TucsonLiving />} />
                <Route path="/listings" element={<V2Listings />} />

                {/* Ad Funnel Routes (Isolated) */}
                <Route path="/ad/seller" element={<SellerLanding />} />
                <Route path="/ad/seller-quiz" element={<SellerQuiz />} />
                <Route path="/ad/seller-result" element={<SellerResult />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
        </VIPProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
