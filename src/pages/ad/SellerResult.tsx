import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SellerFunnelLayout from "@/components/ad/SellerFunnelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { bridgeQuizResultsToV2, bridgeLeadIdToV2, setStoredUserName, setStoredEmail } from "@/lib/analytics/initAdFunnelSession";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

// Value ranges - midpoints for calculation
const VALUE_RANGES: Record<string, number> = {
  "under-200k": 175000,
  "200-350k": 275000,
  "350-500k": 425000,
  "over-500k": 600000,
};

// Calculator function
const calculateNetProceeds = (estimatedValue: number) => {
  // Path A: Cash Offer (75% of value - speed offer)
  const cashOffer = Math.round(estimatedValue * 0.75);
  
  // Path B: Traditional Listing (94% of value minus $5k closing costs)
  const listingNet = Math.round(estimatedValue * 0.94 - 5000);
  
  // Difference
  const difference = listingNet - cashOffer;
  
  return {
    estimatedValue,
    cashOffer,
    listingNet,
    difference,
  };
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Inner component that uses the chat context (rendered inside the provider)
const SellerResultContent = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { openChat, isOpen: isChatOpen } = useSelenaChat();
  const hasTriggeredProactive = useRef(false);

  // Get quiz answers from URL params
  const quizAnswers = {
    situation: searchParams.get("situation") || "",
    condition: searchParams.get("condition") || "",
    timeline: searchParams.get("timeline") || "",
    value: searchParams.get("value") || "200-350k",
    address: searchParams.get("address") || "",
  };

  // Calculate net proceeds
  const calculations = useMemo(() => {
    const estimatedValue = VALUE_RANGES[quizAnswers.value] || 275000;
    return calculateNetProceeds(estimatedValue);
  }, [quizAnswers.value]);
  
  // Store difference for booking page context continuity
  useEffect(() => {
    if (calculations.difference) {
      localStorage.setItem('cc_net_sheet_difference', String(calculations.difference));
    }
  }, [calculations.difference]);
  
  // Loss aversion timer - proactive Selena chat trigger after 30 seconds
  useEffect(() => {
    // Only trigger if form not yet submitted, chat not already open, and not already triggered
    if (isUnlocked || isChatOpen || hasTriggeredProactive.current) return;
    
    const timer = setTimeout(() => {
      hasTriggeredProactive.current = true;
      
      // Open chat
      openChat();
      
      // Dispatch proactive message event after short delay for chat to open
      setTimeout(() => {
        const proactiveMessage = `I noticed the ${formatCurrency(calculations.difference)} difference in your report. Would you like me to explain exactly how we calculated the "Cost of Time" for your property?`;
        
        window.dispatchEvent(new CustomEvent('selena-proactive-message', {
          detail: { message: proactiveMessage }
        }));
      }, 500);
    }, 30000); // 30 seconds
    
    return () => clearTimeout(timer);
  }, [isUnlocked, isChatOpen, calculations.difference, openChat]);

  // Chart data
  const chartData = [
    {
      name: "Cash Offer",
      value: calculations.cashOffer,
      fill: "#E3B23C",
    },
    {
      name: "Traditional Listing",
      value: calculations.listingNet,
      fill: "#22C55E",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get session context for GHL sync
      const sessionId = localStorage.getItem('selena_session_id') || undefined;
      const language = localStorage.getItem('selena_language') || 'en';
      
      const { data, error } = await supabase.functions.invoke('submit-seller', {
        body: {
          name: name.trim(),
          email: email.trim(),
          propertyAddress: quizAnswers.address,
          situation: quizAnswers.situation,
          condition: quizAnswers.condition,
          timeline: quizAnswers.timeline,
          estimatedValue: quizAnswers.value,
          calculatedCashOffer: calculations.cashOffer,
          calculatedListingNet: calculations.listingNet,
          sessionId,
          language,
        },
      });

      if (error) throw error;

      // Bridge quiz answers to V2 session context
      bridgeQuizResultsToV2({
        situation: quizAnswers.situation,
        condition: quizAnswers.condition,
        timeline: quizAnswers.timeline,
        value: quizAnswers.value,
      });

      // Bridge lead_id for V2 continuity (if returned from edge function)
      if (data?.lead_id) {
        bridgeLeadIdToV2(data.lead_id, 'seller_funnel');
        // Store contact info for personalization and gate bypass
        setStoredUserName(name.trim());
        setStoredEmail(email.trim());
      }

      // Unlock the report
      setIsUnlocked(true);
      toast.success("Report sent! Check your texts.", {
        description: "A detailed breakdown has been sent to your inbox.",
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Success indicator */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cc-gold/20 rounded-full mb-4">
            {isUnlocked ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <svg className="w-8 h-8 text-cc-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-cc-gold text-sm font-medium uppercase tracking-wide">
            {isUnlocked ? "Report Unlocked" : "Analysis Complete"}
          </p>
        </div>

        {/* Teaser Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">
            Potential Difference
          </h2>
          <p className="text-cc-gold text-4xl sm:text-5xl font-bold mb-4">
            {formatCurrency(calculations.difference)}
          </p>
          <p className="text-white/60 text-sm mb-6">
            Between Cash Offer and Traditional Listing
          </p>

          {/* Bar Chart Comparison */}
          <div className="mb-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#ffffff40"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#ffffff60"
                  fontSize={12}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value: number) => formatCurrency(value)}
                    fill="#ffffff"
                    fontSize={14}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown - Blurred or Visible */}
          <div className="relative">
            <div className={`space-y-3 p-4 bg-white/5 rounded-xl transition-all duration-500 ${
              isUnlocked ? "" : "blur-sm select-none pointer-events-none"
            }`}>
              <div className="flex justify-between text-white/80">
                <span>Estimated Market Value</span>
                <span>{formatCurrency(calculations.estimatedValue)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Cash Offer (As-Is)</span>
                <span className="text-cc-gold">{formatCurrency(calculations.cashOffer)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Traditional Net (Est.)</span>
                <span className="text-green-400">{formatCurrency(calculations.listingNet)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3 flex justify-between text-white/80">
                <span>Time to Close</span>
                <span>7-14 days vs 45-60 days</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Your Timeline Preference</span>
                <span className="capitalize">{quizAnswers.timeline.replace(/-/g, ' ') || 'Flexible'}</span>
              </div>
            </div>
            
            {/* Lock overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-cc-navy/90 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cc-gold" />
                  <span className="text-white text-sm font-medium">Unlock Full Report</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* The Gate - Lead Capture Form (Hidden when unlocked) */}
        {!isUnlocked && (
          <div className="bg-white/10 border border-cc-gold/30 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="font-serif text-xl text-white mb-2">
                Unlock Your Certified Net Sheet
              </h3>
              <p className="text-white/60 text-sm">
                Get a personalized breakdown with exact numbers for your property.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 text-sm">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cc-gold focus:ring-cc-gold/20"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cc-gold focus:ring-cc-gold/20"
                  required
                  maxLength={255}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Unlock My Net Sheet
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-white/40 text-xs text-center mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        )}

        {/* Success State CTA */}
        {isUnlocked && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-white mb-2">
              Your Net Sheet is Ready
            </h3>
            <p className="text-white/60 text-sm mb-4">
              We've sent a detailed breakdown to {email}. Kasandra will personally reach out shortly.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link to="/v2/book">
                Schedule a Call with Kasandra
              </Link>
            </Button>
          </div>
        )}

        {/* Alternative action */}
        {!isUnlocked && (
          <div className="text-center">
            <p className="text-white/50 text-sm">
              Prefer to talk to a human?{" "}
              <Link 
                to="/v2/book" 
                className="text-cc-gold hover:text-cc-gold/80 underline underline-offset-2"
              >
                Schedule a call with Kasandra
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Outer component that provides the context via SellerFunnelLayout
const SellerResult = () => {
  return (
    <SellerFunnelLayout>
      <SellerResultContent />
    </SellerFunnelLayout>
  );
};

export default SellerResult;
