import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateReportRequest {
  lead_id: string;
  report_type: "net_sheet" | "buyer_readiness" | "cash_comparison" | "home_value_preview";
  context: Record<string, unknown>;
}

interface GenerateReportResponse {
  success: boolean;
  report_id?: string;
  report_markdown?: string;
  requires_verification?: boolean;
  error?: string;
}

// Report type configurations
const REPORT_CONFIGS: Record<string, { title: string; titleEs: string; promptSuffix: string }> = {
  net_sheet: {
    title: "Net Proceeds Estimate",
    titleEs: "Estimación de Ganancias Netas",
    promptSuffix: `Generate a Net Sheet report that includes:
- Estimated sale price range based on Tucson market data
- Typical seller costs (agent commission ~5-6%, title fees, closing costs)
- Cash offer vs traditional listing comparison
- Timeline comparison (cash: 7-14 days vs listing: 30-90 days)
- Net proceeds estimate for each path
Include a clear recommendation based on their situation.`,
  },
  buyer_readiness: {
    title: "Buyer Readiness Assessment",
    titleEs: "Evaluación de Preparación del Comprador",
    promptSuffix: `Generate a Buyer Readiness Assessment that includes:
- Pre-qualification status and recommendations
- Down payment readiness score (0-100)
- Credit considerations and next steps
- Timeline to purchase readiness
- Recommended actions in priority order
- Local Tucson market timing insights`,
  },
  cash_comparison: {
    title: "Cash vs Listing Comparison",
    titleEs: "Comparación de Efectivo vs Listado",
    promptSuffix: `Generate a Cash vs Listing Comparison that includes:
- Detailed breakdown of each option
- Timeline comparison with realistic Tucson market data
- Net proceeds comparison (accounting for all costs)
- Pros and cons for their specific situation
- Clear recommendation based on their timeline and priorities`,
  },
  home_value_preview: {
    title: "Your Home Value Preview",
    titleEs: "Vista Previa del Valor de Su Casa",
    promptSuffix: `Generate a Home Value Preview report that includes:
- General Tucson market context (current conditions, trends)
- Key factors that typically influence home value in Arizona
- Typical seller costs overview (commission, title, closing)
- An invitation to get a more detailed Comparative Market Analysis (CMA) with Kasandra
- Clear disclaimer that this is a preview estimate only, not an appraisal

Keep the tone calm, informational, and trust-building. This is TOFU/MOFU content.
Do NOT make specific price predictions without property details.
If no address or property details are provided, explain what information would help provide a more accurate estimate.
End with a gentle invitation to take the next step when they're ready.`,
  },
};

const SYSTEM_PROMPT = `You are Selena AI, a bilingual real estate concierge and market analyst for Tucson, Arizona.
Generate a professional, calm, and non-pressure report for a homeowner or buyer.
Use their identity, situation, and timeline.

IMPORTANT GUIDELINES:
- Be warm and professional, never pushy
- Use realistic Tucson market data and typical costs
- Always include disclaimers that these are estimates
- If the lead speaks Spanish (language: 'es'), generate the report in Spanish
- Format numbers as currency ($XXX,XXX)
- Use clear section headers

OUTPUT FORMAT:
You must respond with valid JSON containing exactly two fields:
1. "analysis": A structured JSON object with the key data points
2. "markdown": A complete Markdown report ready for display

Example structure:
{
  "analysis": {
    "summary": "...",
    "key_metrics": {...},
    "recommendation": "..."
  },
  "markdown": "# Report Title\\n\\n## Summary\\n..."
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead_id, report_type, context }: GenerateReportRequest = await req.json();

    // Validate inputs
    if (!lead_id) {
      return new Response(
        JSON.stringify({ success: false, error: "lead_id is required" } as GenerateReportResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!report_type || !REPORT_CONFIGS[report_type]) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid report_type" } as GenerateReportResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lead profile
    const { data: lead, error: leadError } = await supabase
      .from("lead_profiles")
      .select("*")
      .eq("id", lead_id)
      .maybeSingle();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch lead profile" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lead) {
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" } as GenerateReportResponse),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt with lead context
    const reportConfig = REPORT_CONFIGS[report_type];
    const language = lead.language || "en";
    
    const leadContext = `
LEAD PROFILE:
- Name: ${lead.name || "Not provided"}
- Email: ${lead.email}
- Language: ${language === "es" ? "Spanish" : "English"}
- Intent: ${lead.intent || "Not specified"}
- Timeline: ${lead.timeline || "Not specified"}
- Situation: ${lead.situation || "Not specified"}
- Property Condition: ${lead.condition || "Not specified"}

ADDITIONAL CONTEXT:
${JSON.stringify(context || {}, null, 2)}
`;

    const userPrompt = `${leadContext}

REPORT TYPE: ${reportConfig.title}

${reportConfig.promptSuffix}

Generate the report in ${language === "es" ? "Spanish" : "English"}.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "AI service busy, please try again" } as GenerateReportResponse),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI service quota exceeded" } as GenerateReportResponse),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Failed to generate report" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ success: false, error: "AI returned empty response" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the AI response - it should be JSON with analysis and markdown
    let reportContent: Record<string, unknown>;
    let reportMarkdown: string;

    try {
      // Try to parse as JSON first
      const cleanedContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      reportContent = parsed.analysis || parsed;
      reportMarkdown = parsed.markdown || rawContent;
    } catch {
      // If JSON parsing fails, use raw content as markdown
      console.warn("Could not parse AI response as JSON, using raw content");
      reportContent = {
        raw_response: rawContent,
        report_type,
        generated_at: new Date().toISOString(),
      };
      reportMarkdown = rawContent;
    }

    // Determine if verification is required (high-value reports)
    const requiresVerification = report_type === "net_sheet" || report_type === "cash_comparison";

    // Insert into lead_reports
    const { data: report, error: insertError } = await supabase
      .from("lead_reports")
      .insert({
        lead_id,
        report_type,
        report_content: reportContent,
        report_markdown: reportMarkdown,
        requires_verification: requiresVerification,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error inserting report:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save report" } as GenerateReportResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report.id,
        report_markdown: reportMarkdown,
        requires_verification: requiresVerification,
      } as GenerateReportResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in generate-report:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" } as GenerateReportResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
