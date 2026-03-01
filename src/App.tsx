import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollManager from "@/components/ScrollManager";
import RouteAnalytics from "@/components/RouteAnalytics";
import NotFound from "./pages/NotFound";
// V2 Pages (Canonical)
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
import V2SellerReadiness from "./pages/v2/V2SellerReadiness";
import V2CashReadiness from "./pages/v2/V2CashReadiness";
import V2CTAQualityAssurance from "./pages/v2/V2CTAQualityAssurance";
import V2QADeterminism from "./pages/v2/V2QADeterminism";
// Ad Funnel Pages
import SellerLanding from "./pages/ad/SellerLanding";
import SellerQuiz from "./pages/ad/SellerQuiz";
import SellerResult from "./pages/ad/SellerResult";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollManager />
          <RouteAnalytics />
          <Routes>
            {/* Legacy redirects → V2 */}
            <Route path="/" element={<Navigate to="/v2" replace />} />
            <Route path="/cash-offer" element={<Navigate to="/v2/cash-offer-options" replace />} />
            <Route path="/podcast/episodes" element={<Navigate to="/v2/podcast" replace />} />
            
            {/* V2 Routes (Canonical) */}
            <Route path="/v2" element={<V2Home />} />
            <Route path="/v2/buy" element={<V2Buy />} />
            <Route path="/v2/sell" element={<V2Sell />} />
            <Route path="/v2/cash-offer-options" element={<V2CashOfferOptions />} />
            <Route path="/v2/guides" element={<V2Guides />} />
            <Route path="/v2/guides/:guideId" element={<V2GuideDetail />} />
            <Route path="/v2/podcast" element={<V2Podcast />} />
            <Route path="/v2/community" element={<V2Community />} />
            <Route path="/v2/book" element={<V2Book />} />
            <Route path="/v2/book/confirmed" element={<V2BookConfirmed />} />
            <Route path="/v2/buyer-readiness" element={<V2BuyerReadiness />} />
            
            <Route path="/v2/private-cash-review" element={<V2PrivateCashReview />} />
            <Route path="/v2/thank-you" element={<V2ThankYou />} />
            
            <Route path="/v2/seller-decision" element={<V2SellerDecision />} />
            <Route path="/v2/seller-readiness" element={<V2SellerReadiness />} />
            <Route path="/v2/cash-readiness" element={<V2CashReadiness />} />
            <Route path="/v2/qa-cta" element={<V2CTAQualityAssurance />} />
            <Route path="/v2/qa-determinism" element={<V2QADeterminism />} />

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

export default App;
