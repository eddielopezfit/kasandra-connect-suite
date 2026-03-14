import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";

const V2Redirect = () => {
  const location = useLocation();
  const newPath = location.pathname.replace(/^\/v2/, '') || '/';
  return <Navigate to={newPath + location.search} replace />;
};
import ScrollManager from "@/components/ScrollManager";
import RouteAnalytics from "@/components/RouteAnalytics";
import NotFound from "./pages/NotFound";
import { initQaAccess } from "@/lib/qa/qaAccess";
// Pages (Canonical)
import V2Home from "./pages/v2/V2Home";
import V2Buy from "./pages/v2/V2Buy";
import V2Sell from "./pages/v2/V2Sell";
import V2CashOfferOptions from "./pages/v2/V2CashOfferOptions";
import V2Guides from "./pages/v2/V2Guides";
import V2GuideDetail from "./pages/v2/V2GuideDetail";
import V2Podcast from "./pages/v2/V2Podcast";
import V2Community from "./pages/v2/V2Community";
import V2Book from "./pages/v2/V2Book";
import V2BookConfirmed from "./pages/v2/V2BookConfirmed";
import V2BuyerReadiness from "./pages/v2/V2BuyerReadiness";

import V2PrivateCashReview from "./pages/v2/V2PrivateCashReview";
import V2ThankYou from "./pages/v2/V2ThankYou";

import V2SellerDecision from "./pages/v2/V2SellerDecision";
import V2SellerTimeline from "./pages/v2/V2SellerTimeline";
import V2SellerReadiness from "./pages/v2/V2SellerReadiness";
import V2CashReadiness from "./pages/v2/V2CashReadiness";
import V2MarketIntelligence from "./pages/v2/V2MarketIntelligence";
import V2NeighborhoodCompare from "./pages/v2/V2NeighborhoodCompare";
import V2BuyerClosingCosts from "./pages/v2/V2BuyerClosingCosts";
import V2CTAQualityAssurance from "./pages/v2/V2CTAQualityAssurance";
import V2QADeterminism from "./pages/v2/V2QADeterminism";
import V2Neighborhoods from "./pages/v2/V2Neighborhoods";
import V2NeighborhoodDetail from "./pages/v2/V2NeighborhoodDetail";
// Ad Funnel Pages
import V2OffMarketBuyer from "./pages/v2/V2OffMarketBuyer";
import V2About from "./pages/v2/V2About";
import V2Contact from "./pages/v2/V2Contact";
import V2Privacy from "./pages/v2/V2Privacy";
import V2Terms from "./pages/v2/V2Terms";
import V2SelenaAI from "./pages/v2/V2SelenaAI";
import SellerLanding from "./pages/ad/SellerLanding";
import SellerQuiz from "./pages/ad/SellerQuiz";
import SellerResult from "./pages/ad/SellerResult";
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // One-time QA access capture (DEV always allowed; production requires secured query param)
    initQaAccess();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollManager />
            <RouteAnalytics />
            <Routes>
              {/* Legacy redirects */}
              <Route path="/v2" element={<Navigate to="/" replace />} />
              <Route path="/v2/*" element={<V2Redirect />} />
              <Route path="/cash-offer" element={<Navigate to="/cash-offer-options" replace />} />
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

              <Route path="/private-cash-review" element={<V2PrivateCashReview />} />
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
              <Route path="/neighborhoods" element={<V2Neighborhoods />} />
              <Route path="/neighborhoods/:slug" element={<V2NeighborhoodDetail />} />
              <Route path="/about" element={<V2About />} />
              <Route path="/contact" element={<V2Contact />} />
              <Route path="/selena-ai" element={<V2SelenaAI />} />
              <Route path="/privacy" element={<V2Privacy />} />
              <Route path="/terms" element={<V2Terms />} />

              {/* Ad Funnel Routes (Isolated) */}
              <Route path="/ad/seller" element={<SellerLanding />} />
              <Route path="/ad/seller-quiz" element={<SellerQuiz />} />
              <Route path="/ad/seller-result" element={<SellerResult />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
