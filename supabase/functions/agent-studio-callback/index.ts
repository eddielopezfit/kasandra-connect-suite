import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * agent-studio-callback
 * Generates contextual deep-links for Agent Studio based on lead intent and session data.
 * Auth: x-admin-secret header required.
 *
 * POST body: { lead_id: string, action: "get_tool_link" | "get_guide_link" | "get_booking_link" }
 * Returns:   { url: string, label: string, description: string, context: {...} }
 */

const BASE_URL = "https://kasandraprietorealtor.com";

/** Intent → tool path mapping */
const TOOL_URL_MAP: Record<string, string> = {
  buy: "/affordability-calculator",
  sell: "/net-to-seller",
  cash: "/cash-offer-options",
  dual: "/affordability-calculator",
  explore: "/neighborhood-compare",
};

/** Tool path → human label */
const TOOL_LABEL_MAP: Record<string, string> = {
  "/affordability-calculator": "Affordability Calculator",
  "/net-to-seller": "Net-to-Seller Calculator",
  "/cash-offer-options": "Cash Offer Options",
  "/neighborhood-compare": "Neighborhood Compare Tool",
};

/** Tool path → description for SMS/email copy */
const TOOL_DESC_MAP: Record<string, string> = {
  "/affordability-calculator":
    "Calculate your Tucson home buying power with DTI analysis and credit score adjustments.",
  "/net-to-seller":
    "See your real net proceeds after commissions, closing costs, and repairs.",
  "/cash-offer-options":
    "Compare a cash offer vs. traditional listing side by side.",
  "/neighborhood-compare":
    "Compare Tucson neighborhoods side by side to find your best fit.",
};

/** Intent → ordered guide slug list */
const GUIDE_LIST_MAP: Record<string, string[]> = {
  buy: [
    "/guides/first-time-buyer-guide",
    "/guides/down-payment-assistance-tucson",
    "/guides/fha-loan-pima-county-2026",
    "/guides/bad-credit-home-buying-tucson",
    "/guides/first-time-buyer-programs-pima-county",
    "/guides/va-home-loan-tucson",
    "/guides/relocating-to-tucson",
  ],
  sell: [
    "/guides/selling-for-top-dollar",
    "/guides/cost-to-sell-tucson",
    "/guides/pricing-strategy",
    "/guides/how-long-to-sell-tucson",
    "/guides/sell-now-or-wait",
    "/guides/home-prep-staging",
  ],
  cash: [
    "/guides/cash-offer-guide",
    "/guides/cash-vs-traditional-sale",
    "/guides/understanding-home-valuation",
  ],
  dual: [
    "/guides/move-up-buyer",
    "/guides/sell-or-rent-tucson",
    "/guides/first-time-buyer-guide",
    "/guides/selling-for-top-dollar",
  ],
  explore: [
    "/guides/tucson-market-update-2026",
    "/guides/tucson-neighborhoods",
    "/guides/first-time-buyer-guide",
    "/guides/understanding-home-valuation",
  ],
};

/** Guide slug → human label */
const GUIDE_LABEL_MAP: Record<string, string> = {
  "/guides/first-time-buyer-guide": "First-Time Home Buyer Guide",
  "/guides/down-payment-assistance-tucson": "Down Payment Assistance Programs",
  "/guides/fha-loan-pima-county-2026": "FHA Loan Guide for Pima County",
  "/guides/bad-credit-home-buying-tucson": "Buying with Bad Credit in Tucson",
  "/guides/first-time-buyer-programs-pima-county": "First-Time Buyer Programs in Pima County",
  "/guides/va-home-loan-tucson": "VA Home Loans in Tucson",
  "/guides/relocating-to-tucson": "Relocating to Tucson Guide",
  "/guides/selling-for-top-dollar": "Selling for Top Dollar in Tucson",
  "/guides/cost-to-sell-tucson": "Cost to Sell in Tucson",
  "/guides/pricing-strategy": "Pricing Strategy Guide",
  "/guides/how-long-to-sell-tucson": "How Long to Sell in Tucson",
  "/guides/sell-now-or-wait": "Should You Sell Now or Wait?",
  "/guides/home-prep-staging": "Home Prep & Staging Guide",
  "/guides/cash-offer-guide": "How to Get a Cash Offer",
  "/guides/cash-vs-traditional-sale": "Cash vs Traditional Sale",
  "/guides/understanding-home-valuation": "Understanding Home Valuation",
  "/guides/move-up-buyer": "Move-Up Buyer Guide",
  "/guides/sell-or-rent-tucson": "Sell or Rent in Tucson?",
  "/guides/tucson-market-update-2026": "Tucson Market Update 2026",
  "/guides/tucson-neighborhoods": "Tucson Neighborhoods Guide",
};

/** Guide slug → description for SMS/email copy */
const GUIDE_DESC_MAP: Record<string, string> = {
  "/guides/first-time-buyer-guide":
    "Everything a first-time buyer in Tucson needs to know — financing, inspections, and down payment programs.",
  "/guides/down-payment-assistance-tucson":
    "Up to $20,000 in down payment assistance available to Tucson buyers in 2026.",
  "/guides/fha-loan-pima-county-2026":
    "FHA loan limits for Pima County in 2026 and how to use FHA financing to buy your first home.",
  "/guides/bad-credit-home-buying-tucson":
    "Buy a home in Tucson with a low credit score — FHA minimums, credit repair timelines, and local lenders.",
  "/guides/first-time-buyer-programs-pima-county":
    "The complete list of first-time buyer programs in Pima County for 2026.",
  "/guides/va-home-loan-tucson":
    "VA home loan benefits and eligibility for Tucson-area military families.",
  "/guides/relocating-to-tucson":
    "Everything you need to know about relocating to Tucson — neighborhoods, cost of living, and lifestyle.",
  "/guides/selling-for-top-dollar":
    "Proven strategies to maximize your Tucson home sale price — pricing, staging, and negotiation tactics.",
  "/guides/cost-to-sell-tucson":
    "All the costs involved in selling a home in Tucson — commissions, repairs, and closing costs breakdown.",
  "/guides/pricing-strategy":
    "Data-driven pricing strategies for Tucson homes — CMA analysis and market positioning.",
  "/guides/how-long-to-sell-tucson":
    "Current days-on-market data for Tucson and what affects your home's selling timeline.",
  "/guides/sell-now-or-wait":
    "Data-backed analysis of Tucson's 2026 housing market and what waiting actually costs you.",
  "/guides/home-prep-staging":
    "How to prepare and stage your Tucson home for a faster, higher-value sale.",
  "/guides/cash-offer-guide":
    "Everything you need to know about accepting a cash offer in Tucson — what it includes and how to compare it.",
  "/guides/cash-vs-traditional-sale":
    "Side-by-side comparison of cash vs traditional sale in Tucson — timeline, net proceeds, and certainty.",
  "/guides/understanding-home-valuation":
    "Understand exactly how your Tucson home's value is determined — CMA, appraisals, and price per sq ft.",
  "/guides/move-up-buyer":
    "Guide for current homeowners looking to sell and buy a bigger home in Tucson.",
  "/guides/sell-or-rent-tucson":
    "Should you sell or rent your Tucson property? A financial comparison for 2026.",
  "/guides/tucson-market-update-2026":
    "Comprehensive Tucson real estate market update for 2026 — inventory, price trends, and forecasts.",
  "/guides/tucson-neighborhoods":
    "Explore Tucson's top neighborhoods — lifestyle, schools, pricing, and commute times.",
};

/** Append ?lang=es or &lang=es depending on existing query params */
function withLang(url: string, language: string): string {
  if ((language ?? "en").toLowerCase() === "es") {
    return url.includes("?") ? `${url}&lang=es` : `${url}?lang=es`;
  }
  return url;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: check x-admin-secret header
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== Deno.env.get("ADMIN_SECRET")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { lead_id, action } = await req.json();

    if (!lead_id || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: lead_id, action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const validActions = ["get_tool_link", "get_guide_link", "get_booking_link"];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead profile
    const { data: lead, error: leadError } = await supabase
      .from("lead_profiles")
      .select("intent, language, session_id")
      .eq("id", lead_id)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const intent = (lead.intent as string) ?? "explore";
    const language = (lead.language as string) ?? "en";

    // Fetch guides_read from session_snapshots
    let guidesRead: string[] = [];
    if (lead.session_id) {
      const { data: snapshot } = await supabase
        .from("session_snapshots")
        .select("guides_read")
        .eq("session_id", lead.session_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (snapshot?.guides_read && Array.isArray(snapshot.guides_read)) {
        guidesRead = snapshot.guides_read as string[];
      }
    }

    // ── get_tool_link ──
    if (action === "get_tool_link") {
      const toolPath = TOOL_URL_MAP[intent] ?? TOOL_URL_MAP.explore;
      const fullUrl = BASE_URL + withLang(toolPath, language);

      return new Response(
        JSON.stringify({
          url: fullUrl,
          label: TOOL_LABEL_MAP[toolPath] ?? "Interactive Tool",
          description: TOOL_DESC_MAP[toolPath] ?? "A free interactive tool to help with your real estate journey.",
          context: { intent, language },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── get_guide_link ──
    if (action === "get_guide_link") {
      const guideList = GUIDE_LIST_MAP[intent] ?? GUIDE_LIST_MAP.explore;
      // Pick first unread guide; fall back to first in list
      const unread = guideList.find((g) => !guidesRead.some((r) => g.includes(r)));
      const guide = unread ?? guideList[0];
      const fullUrl = BASE_URL + withLang(guide, language);

      return new Response(
        JSON.stringify({
          url: fullUrl,
          label: GUIDE_LABEL_MAP[guide] ?? "Free Real Estate Guide",
          description: GUIDE_DESC_MAP[guide] ?? "A free bilingual guide to help you navigate the Tucson real estate market.",
          context: { intent, language, guides_read_count: guidesRead.length },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── get_booking_link ──
    if (action === "get_booking_link") {
      const bookingPath = `/book?intent=${encodeURIComponent(intent)}&lead_id=${encodeURIComponent(lead_id)}&source=agent_studio`;
      const fullUrl = BASE_URL + withLang(bookingPath, language);

      return new Response(
        JSON.stringify({
          url: fullUrl,
          label: language === "es" ? "Agendar Sesión Estratégica" : "Book Strategy Session",
          description: language === "es"
            ? "Agenda una sesión estratégica complementaria de 20 minutos con Kasandra Prieto — REALTOR® bilingüe en Tucson."
            : "Book a complimentary 20-minute strategy session with Kasandra Prieto — bilingual Tucson REALTOR®.",
          context: { intent, language },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Unhandled action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[agent-studio-callback] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
