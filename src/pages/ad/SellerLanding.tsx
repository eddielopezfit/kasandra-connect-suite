import { useEffect } from "react";
import { Link } from "react-router-dom";
import SellerFunnelLayout from "@/components/ad/SellerFunnelLayout";
import { Button } from "@/components/ui/button";
import SelenaTextTrigger from "@/components/ad/SelenaTextTrigger";
import { initAdFunnelSession } from "@/lib/analytics/initAdFunnelSession";

const SellerLanding = () => {
  // Initialize ad funnel session on mount
  useEffect(() => {
    initAdFunnelSession();
  }, []);

  return (
    <SellerFunnelLayout>
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cc-gold/10 border border-cc-gold/30 rounded-full px-4 py-2">
            <span className="text-cc-gold text-sm font-medium">
              Free • No Obligation • Confidential
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            Inherited a Home in Tucson?{" "}
            <span className="text-cc-gold">See What It's Actually Worth.</span>
          </h1>

          {/* Subhead */}
          <p className="text-cc-sand text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Compare a Cash Offer vs. Traditional Listing in 60 seconds.
          </p>

          {/* Primary CTA */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link to="/ad/seller-quiz">
                Start Free Net Sheet
              </Link>
            </Button>
          </div>

          {/* Secondary CTA - Now wired to Selena AI */}
          <p className="text-white/60 text-sm">
            Have questions?{" "}
            <SelenaTextTrigger />
          </p>

          {/* Trust indicators */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No pressure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Results in 60 sec</span>
            </div>
          </div>
        </div>
      </div>
    </SellerFunnelLayout>
  );
};

export default SellerLanding;
