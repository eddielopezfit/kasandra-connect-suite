import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * agent-studio-callback
 * Endpoint for GHL Agent Studio to fetch personalized deep links
 * for SMS/email sequences based on lead intent and session context.
 *
 * Auth: x-admin-secret header (same pattern as cost-bearing functions)
 */

const BASE_URL = "https://kasandraprietorealtor.com";

const TOOL_LINKS: Record<string, { url: string; label: string }> = {
  buy: { url: "/affordability-calculator", label: "Affordability Calculator" },
  sell: { url: "/net-to-seller", label: "Net-to-Seller Calculator" },
  cash: { url: "/cash-offer-options", label: "Cash Offer Options" },
  dual: { url: "/affordability-calculator", label: "Affordability Calculator" },
  explore: { url: "/guides", label: "Resource Guides" },
};

const GUIDE_LINKS: Record<string, { url: string; label: string }[]> = {
  buy: [
    { url: "/guides/first-time-buyer-guide", label: "First-Time Buyer Guide" },
    { url: "/guides/down-payment-assistance-tucson", label: "Down Payment Assistance" },
    { url: "/guides/fha-loan-pima-county-2026", label: "FHA Loans in Pima County" },
    { url: "/guides/va-home-loan-tucson", label: "VA Home Loans" },
    { url: "/guides/relocating-to-tucson", label: "Relocating to Tucson" },
  ],
  sell: [
    { url: "/guides/cost-to-sell-tucson", label: "Cost to Sell in Tucson" },
    { url: "/guides/pricing-strategy", label: "Pricing Strategy" },
    { url: "/guides/how-long-to-sell-tucson", label: "How Long to Sell" },
    { url: "/guides/sell-now-or-wait", label: "Sell Now or Wait?" },
    { url: "/guides/home-prep-staging", label: "Home Prep & Staging" },
  ],
  cash: [
    { url: "/guides/cash-offer-guide", label: "Cash Offer Guide" },
    { url: "/guides/cash-vs-traditional-sale", label: "Cash vs Traditional Sale" },
  ],
  dual: [
    { url: "/guides/move-up-buyer", label: "Move-Up Buyer Guide" },
    { url: "/guides/sell-or-rent-tucson", label: "Sell or Rent?" },
  ],
  explore: [
    { url: "/guides/tucson-market-update-2026", label: "Tucson Market Update" },
    { url: "/guides/tucson-neighborhoods", label: "Tucson Neighborhoods" },
  ],
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin auth guard
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
    const { data: lead } = await supabase
      .from("lead_profiles")
      .select("intent, language, session_id")
      .eq("id", lead_id)
      .maybeSingle();

    const intent = (lead?.intent as string) ?? "explore";
    const language = (lead?.language as string) ?? "en";
    const langSuffix = language === "es" ? "?lang=es" : "";

    if (action === "get_tool_link") {
      const tool = TOOL_LINKS[intent] ?? TOOL_LINKS.explore;
      return new Response(
        JSON.stringify({
          url: `${BASE_URL}${tool.url}${langSuffix}`,
          label: tool.label,
          context: { intent, language },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "get_guide_link") {
      // Check which guides the lead has already read
      let guidesRead: string[] = [];
      if (lead?.session_id) {
        const { data: snapshot } = await supabase
          .from("session_snapshots")
          .select("guides_read")
          .eq("session_id", lead.session_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        guidesRead = (snapshot?.guides_read as string[]) ?? [];
      }

      const candidates = GUIDE_LINKS[intent] ?? GUIDE_LINKS.explore;
      // Find first unread guide
      const unread = candidates.find((g) => !guidesRead.some((r) => g.url.includes(r)));
      const guide = unread ?? candidates[0];

      return new Response(
        JSON.stringify({
          url: `${BASE_URL}${guide.url}${langSuffix}`,
          label: guide.label,
          context: { intent, language, guides_read_count: guidesRead.length },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "get_booking_link") {
      return new Response(
        JSON.stringify({
          url: `${BASE_URL}/book?intent=${intent}&lead_id=${lead_id}&source=agent_studio${language === "es" ? "&lang=es" : ""}`,
          label: language === "es" ? "Agendar Sesión Estratégica" : "Book Strategy Session",
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
