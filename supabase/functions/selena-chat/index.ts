/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA CHAT - AI Concierge Edge Function (Decision Certainty Engine)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CONTRACT (v2 - UPDATED 2026-02-08):
 * 
 * CANONICAL INTENTS: buy | sell | cash | dual | explore
 * CANONICAL TIMELINES: asap | 30_days | 60_90
 * 
 * INTENT PRIORITY ORDER: cash > dual > sell > buy > explore
 *   - When multiple intents are detected, the highest priority wins as primaryIntent
 * 
 * 4-MODE ARCHITECTURE (Decision Certainty):
 *   MODE 1: ORIENTATION - First contact, reduce anxiety, ONE question only
 *   MODE 2: CLARITY BUILDING - Reference journey, suggest tools/guides
 *   MODE 3: CONFIDENCE & SYNTHESIS - Reflect progress, position Kasandra subtly
 *   MODE 4: HANDOFF - Booking as continuation of clarity (earned access)
 * 
 * EARNED ACCESS GATE:
 *   Booking CTAs (actions array) are ONLY shown when user has "earned" access:
 *   
 *   1. EXPLICIT ASK: User message contains booking keywords (book, schedule, call, etc.)
 *   2. TOOL COMPLETION: context.tool_used OR context.last_tool_result OR context.quiz_completed
 *   3. EMAIL PROVIDED: extractedEmail from message (commitment signal)
 *   4. ENGAGED TURNS: 2+ user turns AND intent is NOT "explore"
 *   
 *   If none of these are true → actions: [] (no CTA shown)
 * 
 * REFLECTION SENTENCE FORMULA (Modes 2 & 3):
 *   "From what you've explored so far — especially [guide/tool/action] — 
 *    it sounds like you're trying to [goal]."
 * 
 * STALL RECOVERY (Mode 3.5):
 *   After 5+ turns without forward motion, offer summary or exit option
 * 
 * POST-BOOKING IDENTITY REINFORCEMENT:
 *   "You've already done the hard part — thinking this through carefully."
 * 
 * CTA LABEL: "Review Strategy with Kasandra" (never "Free Consultation")
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";
import { 
  detectMode, 
  MODE_INSTRUCTIONS_EN, 
  MODE_INSTRUCTIONS_ES,
  TOPIC_HINTS_EN,
  TOPIC_HINTS_ES,
  type ConversationMode,
  type ConversationState,
} from "./modeContext.ts";
import { buildGuardState, applyGuardRules } from "./guardState.ts";
import { classifyJourneyState } from "./journeyState.ts";
import { generateEntryGreeting, type EntryContext } from "./entryGreetings.ts";

// ============= MODULAR IMPORTS =============
import type { ChatMessage, ChatRequest, CanonicalIntent } from "./types.ts";
import { detectIntent, normalizeIntent, pickPrimaryIntent, detectTimeline, INHERITED_HOME_PATTERNS, TRUST_SIGNAL_PATTERNS } from "./intentDetection.ts";
import { extractEmail, upsertLeadProfile, logDataCapture, EMAIL_REGEX } from "./leadCapture.ts";
import { 
  userAskedToBook, userTurnCount, hasEarnedBookingAccess, filterSuggestionsForEarnedAccess,
  buildConversationState, isStalled, isSimilar, sanitizeBracketCTAs, getCached, setCache,
  BOOKING_KEYWORDS, BOOKING_PHRASES,
} from "./bookingLogic.ts";
import {
  type SessionEngagementState, inferSessionState, detectLoop, getGovernedChips,
  CHIP_KEYS, CHIP_KEY_DESTINATION, CHIP_DESTINATION, TOOL_BLOCKED_DESTINATIONS,
  DESTINATION_TO_CHIP_KEY, DESTINATION_TO_CHIP, GUIDE_DELIVERY_AFFIRMATIVE, GUIDE_MENTION_PATTERN,
  detectGuideChipForDelivery, type ChipSuppressionEvent, filterChipsForCompletedTools,
  PROGRESSION_MAP, getSuggestedReplies, PROCEEDS_PATTERNS,
} from "./chipGovernance.ts";
import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_ES, stripSection, buildSystemPrompt } from "./systemPromptBuilder.ts";

// ============= MAIN HANDLER =============
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { message: rawMessage, context, history: rawHistory = [] }: ChatRequest = body;

    // ── Input guards: length-cap before anything touches the AI gateway ──────
    const MAX_MESSAGE_CHARS = 2000;
    const MAX_HISTORY_TURNS = 10;
    const MAX_HISTORY_TURN_CHARS = 1000;

    if (!rawMessage || typeof rawMessage !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const message = rawMessage.slice(0, MAX_MESSAGE_CHARS);
    const history = (Array.isArray(rawHistory) ? rawHistory : [])
      .slice(-MAX_HISTORY_TURNS)
      .map(m => ({ role: m.role, content: String(m.content ?? '').slice(0, MAX_HISTORY_TURN_CHARS) }));

    // Rate limiting + handler-scoped Supabase client
    const rlUrl = Deno.env.get("SUPABASE_URL");
    const rlKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = (rlUrl && rlKey) ? createClient(rlUrl, rlKey) : null;
    if (supabase) {
      const rlk = extractRateLimitKey(req, body);
      const rl = await checkRateLimit(supabase, rlk, 'selena-chat');
      if (!rl.allowed) return rateLimitResponse(corsHeaders);
    }

    // ============= CONTEXT AUDIT (Concierge Memory Fallback) =============
    // Fires ONLY when client signals it has no context (localStorage cleared,
    // new device, returning user). Parallel fetch — single round-trip (~20ms).
    const needsAudit = !context.intent && !context.last_tool_completed && context.session_id;
    let serverName: string | null = null;

    if (needsAudit && rlUrl && rlKey) {
      try {
        const auditClient = createClient(rlUrl, rlKey);
        const leadId = context.lead_id;

        const [snapRes, leadRes, receiptRes] = await Promise.allSettled([
          auditClient
            .from('session_snapshots')
            .select('intent, tools_completed, readiness_score, calculator_data, context_json')
            .eq('session_id', context.session_id)
            .maybeSingle(),
          leadId
            ? auditClient
                .from('lead_profiles')
                .select('name, situation, timeline, intent, lead_score, lead_grade')
                .eq('id', leadId)
                .maybeSingle()
            : Promise.resolve({ status: 'fulfilled', value: { data: null } }),
          auditClient
            .from('decision_receipts')
            .select('receipt_data')
            .eq('session_id', context.session_id)
            .eq('receipt_type', 'seller_decision')
            .maybeSingle(),
        ]);

        // Helper: treats null, undefined, and '' as "no value"
        const filled = (v: unknown): boolean =>
          v !== null && v !== undefined && v !== '';

        // Merge session snapshot — server authoritative for critical fields, client wins for others
        if (snapRes.status === 'fulfilled' && snapRes.value?.data) {
          const snap = snapRes.value.data as Record<string, unknown>;
          
          // AUTHORITATIVE FIELDS (Server overwrites client)
          if (filled(snap.intent)) context.intent = snap.intent as string;
          if (Array.isArray(snap.tools_completed) && snap.tools_completed.length > 0)
            context.tools_completed = snap.tools_completed as string[];
          if (filled(snap.readiness_score))
            context.readiness_score = snap.readiness_score as number;
            
          const calcData = snap.calculator_data as Record<string, unknown> | null;
          if (calcData) {
            if (!filled(context.estimated_value) && filled(calcData.estimated_value))
              context.estimated_value = calcData.estimated_value as number;
            if (!filled(context.calculator_difference) && filled(calcData.calculator_difference))
              context.calculator_difference = calcData.calculator_difference as number;
          }
          
          const ctxJson = snap.context_json as Record<string, unknown> | null;
          if (ctxJson) {
            // AUTHORITATIVE FIELDS in context_json
            if (filled(ctxJson.timeline)) context.timeline = ctxJson.timeline as string;
            if (filled(ctxJson.chip_phase_floor)) context.chip_phase_floor = ctxJson.chip_phase_floor as number;
            if (filled(ctxJson.journey_state)) context.journey_state = ctxJson.journey_state as string;
            
            // PASSIVE FIELDS (Client wins, server fills nulls only)
            if (!filled(context.situation) && filled(ctxJson.situation))
              context.situation = ctxJson.situation as string;
            if (!filled(context.last_neighborhood_zip) && filled(ctxJson.last_neighborhood_zip))
              context.last_neighborhood_zip = ctxJson.last_neighborhood_zip as string;
          }
        }

        // Merge lead profile
        if (leadRes.status === 'fulfilled' && (leadRes.value as { data: unknown })?.data) {
          const lead = (leadRes.value as { data: Record<string, unknown> }).data;
          if (filled(lead.name)) serverName = lead.name as string;
          if (!filled(context.situation) && filled(lead.situation))
            context.situation = lead.situation as string;
          if (!filled(context.timeline) && filled(lead.timeline))
            context.timeline = lead.timeline as string;
          if (!filled(context.intent) && filled(lead.intent))
            context.intent = lead.intent as string;
          // P1: Lead score into Selena context
          if (filled(lead.lead_score)) context.lead_score = lead.lead_score as number;
          if (filled(lead.lead_grade)) context.lead_grade = lead.lead_grade as string;
        }

        // Merge decision receipt
        if (receiptRes.status === 'fulfilled' && receiptRes.value?.data) {
          const rd = (receiptRes.value.data as { receipt_data: Record<string, unknown> }).receipt_data;
          if (!filled(context.seller_decision_recommended_path) && filled(rd?.recommended_path))
            context.seller_decision_recommended_path = rd.recommended_path as string;
          if (!filled(context.seller_goal_priority) && filled(rd?.goal_priority))
            context.seller_goal_priority = rd.goal_priority as string;
          if (!filled(context.property_condition_raw) && filled(rd?.condition))
            context.property_condition_raw = rd.condition as string;
        }
      } catch (_auditErr) {
        // Non-fatal — context audit failure never blocks the chat response
      }
    }

    const language = (() => {
      const clientLang = context.language || 'en';
      // Priority 1: Detect CURRENT message language (overrides stale session lang)
      const spanishSignals = /\b(quiero|necesito|busco|estoy|comprar|vender|casa|ayuda|hola|tengo|puedo|dónde|cómo|cuánto|gracias|por favor|quería|quisiera|podría|favor)\b/i;
      const englishSignals = /\b(want|need|looking|help|sell|buy|home|house|how much|can I|should I|what is|tell me|show me|get|find|market|offer|value|worth|move|moving|divorce|inherited)\b/i;
      const hasSpanish = spanishSignals.test(message);
      const hasEnglish = englishSignals.test(message);
      // If message has English signals but no Spanish, it's English — even if session was Spanish
      if (hasEnglish && !hasSpanish) return 'en';
      // If message has Spanish signals, it's Spanish
      if (hasSpanish) return 'es';
      // Fallback to client toggle
      return clientLang;
    })();
    let leadId = context.lead_id;

    const detectedIntents = detectIntent(message, context.route);
    const timeline = detectTimeline(message);

    // Primary intent (canonical) - uses priority order: cash > dual > sell > buy > explore
    const primaryIntent = pickPrimaryIntent(detectedIntents);

    // Determine effective intent (detected now OR previously stored)
    const effectiveIntent = primaryIntent !== 'explore' ? primaryIntent : (context.intent || 'explore');

    // Identity Upgrade & Persistence (only on email capture)
    const extractedEmail = extractEmail(message);
    if (extractedEmail) {
      const upsert = await upsertLeadProfile(extractedEmail, context, primaryIntent, timeline || undefined);
      if (upsert.success) {
        leadId = upsert.lead_id;
        await logDataCapture(context.session_id, "selena_data_email_captured", { lead_id: leadId });
      }
    }

    // ============= CHIP GOVERNANCE: INFER SESSION STATE =============
    const engagement = inferSessionState(history, context, message);
    
    // PROCEEDS OVERRIDE: immediate — supersedes all phase logic
    const proceedsOverride = engagement.hasAskedProceeds || PROCEEDS_PATTERNS.test(message);
    
    // ASAP OVERRIDE: immediate — reduce education, route to action
    const asapTimeline = timeline === 'asap' || context.intent === 'asap';

    // Build conversation state for mode detection
    const conversationState = buildConversationState(context, history, message, extractedEmail, primaryIntent);
    const detectedModeContext = detectMode(conversationState);

    // ============= CONVERSATION STATE GUARD v1.0 =============
    const guardState = buildGuardState(history, context, message);
    const guardRules = applyGuardRules(guardState, language, message);

    // ============= P10: DISTRESS → KASANDRA ALERT =============
    // When containment activates with escalation 'suggest' OR vulnerability signals >= 2, fire notify-handoff
    const isDistressAlert = guardState.containment_active && 
      (guardState.escalation_level === 'suggest' || guardState.vulnerability_signal_count >= 2);
    if (isDistressAlert && leadId && supabase) {
      try {
        const { data: leadData } = await supabase
          .from('lead_profiles')
          .select('name, email, phone')
          .eq('id', leadId)
          .maybeSingle();

        if (leadData?.email) {
          const nameParts = (leadData.name || '').split(' ');
          fetch(`${rlUrl}/functions/v1/notify-handoff`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${rlKey}`,
            },
            body: JSON.stringify({
              contact: {
                email: leadData.email,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                phone: leadData.phone || '',
              },
              context: {
                selena_lead_id: leadId,
                session_id: context.session_id,
                intent: effectiveIntent,
                language,
                readiness_score: context.readiness_score ?? 0,
                journey_state: 'decide',
                inherited_home: context.inherited_home ?? false,
                trust_signal_detected: context.trust_signal_detected ?? false,
              },
            }),
          }).catch(e => console.error('[Selena] P10 distress alert failed:', e));
          console.log(`[Selena] P10: Distress alert fired for lead ${leadId}`);
        }
      } catch (e) {
        console.error('[Selena] P10 distress alert error:', e);
      }
    }

    // RULE 9: Human takeover — block AI generation entirely
    if (guardRules.blockGeneration) {
      return new Response(
        JSON.stringify({
          ok: true,
          reply: '',
          suggestedReplies: [],
          actions: [],
          language,
          lead_id: leadId,
          detected_intent: primaryIntent !== 'explore' ? primaryIntent : null,
          booking_cta_shown: false,
          current_mode: context.current_mode ?? 1,
          mode_name: 'HUMAN_TAKEOVER',
          guard_violations: guardRules.violations,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // UNIVERSAL MONOTONIC MODE FLOOR: Mode must never decrease within a session.
    const clientMode = (context.current_mode ?? 0) as number;
    const detectedMode = detectedModeContext.mode;
    
    // P1: Lead grade mode override — A-grade starts Mode 3, B-grade Mode 2
    let leadGradeModeFloor = 0;
    if (context.lead_grade === 'A') leadGradeModeFloor = 3;
    else if (context.lead_grade === 'B') leadGradeModeFloor = 2;
    
    const effectiveMode = Math.max(clientMode, detectedMode, leadGradeModeFloor) as ConversationMode;
    
    // Select the correct modeContext for the effective mode
    const modeContext = effectiveMode !== detectedMode
      ? (() => {
          // Re-derive context for the floored mode
          if (effectiveMode === 4) return { mode: 4 as ConversationMode, modeName: 'HANDOFF', allowBookingCTA: true, reflectionRequired: false };
          if (effectiveMode === 3) return { mode: 3 as ConversationMode, modeName: 'CONFIDENCE', allowBookingCTA: false, reflectionRequired: true };
          if (effectiveMode === 2) return { mode: 2 as ConversationMode, modeName: 'CLARITY', allowBookingCTA: false, reflectionRequired: true };
          return detectedModeContext;
        })()
      : detectedModeContext;
    const currentMode: ConversationMode = modeContext.mode;
    
    // Log mode transition for analytics (fire-and-forget — FM-11)
    logDataCapture(context.session_id, "selena_mode_transition", { 
      mode: currentMode, 
      mode_name: modeContext.modeName,
      user_turns: conversationState.userTurns,
      chip_phase: getGovernedChips(effectiveIntent, timeline, engagement, language, { guidesReadCount: context.guides_read ?? 0 }).phase,
      chip_escalated: getGovernedChips(effectiveIntent, timeline, engagement, language, { guidesReadCount: context.guides_read ?? 0 }).escalated ?? false,
    }).catch(() => {});

    // Check for stall condition (Mode 3.5 behavior)
    const stalled = isStalled(history, message);

    // Build system prompt with mode context
    const systemPrompt = buildSystemPrompt(language, effectiveIntent, (context.tools_completed ?? []).length > 0);

    // ============= VIP CONTEXT INJECTION =============
    // Build a concise Visitor Intelligence Profile summary for Selena's awareness.
    // This replaces scattered context reads with a unified intelligence block.
    const toolsCompletedList = (context.tools_completed ?? []);
    const guidesCompletedList = (context.guides_completed ?? []);
    const readinessScore = context.readiness_score ?? 0;
    const sellerPath = context.seller_decision_recommended_path;
    const hasBooked = context.has_booked ?? false;
    const frictionSignals: string[] = [];
    if (toolsCompletedList.length >= 2 && !hasBooked) frictionSignals.push('high_tool_usage_no_booking');
    if (guidesCompletedList.length >= 3 && toolsCompletedList.length === 0) frictionSignals.push('guide_heavy_no_tools');
    if (readinessScore > 0 && !hasBooked) frictionSignals.push('has_readiness_no_booking');
    
    // Journey depth (mirrors client VIP selector)
    const vipJourneyDepth = (readinessScore > 0 || sellerPath || hasBooked) ? 'ready'
      : (toolsCompletedList.length >= 1 || guidesCompletedList.length >= 3) ? 'engaged'
      : (effectiveIntent !== 'explore' || guidesCompletedList.length >= 1) ? 'exploring'
      : 'new';
    
    // Booking readiness (mirrors client selector)
    const hasDecisionSignal = !!(readinessScore || sellerPath);
    const highToolUsage = toolsCompletedList.length >= 2;
    const vipBookingReadiness = hasBooked ? 'converted'
      : (hasDecisionSignal || highToolUsage) ? (guidesCompletedList.length >= 5 && highToolUsage ? 'overdue' : 'ready')
      : (effectiveIntent !== 'explore' || toolsCompletedList.length >= 1) ? 'warming'
      : 'not_ready';

    // Build continuation summary parts
    const vipSummaryParts: string[] = [];
    if (effectiveIntent && effectiveIntent !== 'explore') vipSummaryParts.push(`intent: ${effectiveIntent}`);
    if (readinessScore > 0) vipSummaryParts.push(`readiness: ${readinessScore}/100`);
    if (context.estimated_value) vipSummaryParts.push(`est_value: $${context.estimated_value.toLocaleString()}`);
    if (context.estimated_budget) vipSummaryParts.push(`budget: $${context.estimated_budget.toLocaleString()}`);
    if (toolsCompletedList.length > 0) vipSummaryParts.push(`tools: ${toolsCompletedList.join(', ')}`);
    if (guidesCompletedList.length > 0) vipSummaryParts.push(`guides_read: ${guidesCompletedList.length}`);
    if (sellerPath) vipSummaryParts.push(`seller_path: ${sellerPath}`);
    if (context.primary_priority) vipSummaryParts.push(`priority: ${context.primary_priority}`);
    if (context.last_neighborhood_zip) vipSummaryParts.push(`area: ${context.last_neighborhood_zip}`);

    const vipOrchestrationRulesEN = `\n\n[ORCHESTRATION RULES — MANDATORY]
1. When VIP context is available, you MUST reference at least one known fact in your response (intent, tool completed, readiness, area explored). Never respond generically when you have context.
2. Every response MUST include or imply a recommended next step. If the user has completed a tool, suggest the logical follow-up. If they've read guides, suggest a tool. If they have readiness, suggest booking.
3. When booking readiness is "ready" or "overdue", your response MUST include a booking suggestion or acknowledge their preparedness.
4. When friction signals are present, acknowledge the user's effort and gently redirect toward action.
5. Never ask a question the system already has an answer to (e.g., don't ask intent if VIP shows intent).`;

    const vipOrchestrationRulesES = `\n\n[REGLAS DE ORQUESTACIÓN — OBLIGATORIAS]
1. Cuando hay contexto VIP disponible, DEBES referenciar al menos un dato conocido en tu respuesta (intención, herramienta completada, preparación, área explorada). Nunca respondas genéricamente cuando tienes contexto.
2. Cada respuesta DEBE incluir o implicar un próximo paso recomendado. Si el usuario completó una herramienta, sugiere el seguimiento lógico. Si leyó guías, sugiere una herramienta. Si tiene preparación, sugiere reservar.
3. Cuando la preparación para reserva es "ready" u "overdue", tu respuesta DEBE incluir una sugerencia de reserva o reconocer su preparación.
4. Cuando hay señales de fricción, reconoce el esfuerzo del usuario y redirige suavemente hacia la acción.
5. Nunca hagas una pregunta de la que el sistema ya tiene respuesta (ej: no preguntes la intención si el VIP muestra intención).`;

    const orchestrationBlock = vipSummaryParts.length > 0
      ? (language === 'es' ? vipOrchestrationRulesES : vipOrchestrationRulesEN)
      : '';

    const vipHint = vipSummaryParts.length > 0 ? (language === 'es'
      ? `\n\n[PERFIL DE INTELIGENCIA DEL VISITANTE]\nProfundidad: ${vipJourneyDepth} | Preparación para reserva: ${vipBookingReadiness}\nResumen: ${vipSummaryParts.join(' · ')}${frictionSignals.length > 0 ? `\nSeñales de fricción: ${frictionSignals.join(', ')}` : ''}\nUsa este contexto para personalizar tu respuesta. NO repitas datos que el usuario ya proporcionó.${orchestrationBlock}`
      : `\n\n[VISITOR INTELLIGENCE PROFILE]\nDepth: ${vipJourneyDepth} | Booking readiness: ${vipBookingReadiness}\nSummary: ${vipSummaryParts.join(' · ')}${frictionSignals.length > 0 ? `\nFriction signals: ${frictionSignals.join(', ')}` : ''}\nUse this context to personalize your response. Do NOT repeat data the user already provided.${orchestrationBlock}`)
      : '';

    console.log(`[Selena] System prompt assembled: ${systemPrompt.length} chars, intent: ${effectiveIntent}, vip_depth: ${vipJourneyDepth}, booking_readiness: ${vipBookingReadiness}`);

    // ============= PERSISTENT MEMORY RECALL =============
    // Fetch stored memories from conversation_memory table via selena-memory function
    let persistentMemoryHint = "";
    try {
      const memoryRecallUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/selena-memory`;
      const memoryRes = await fetch(memoryRecallUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          action: "recall",
          session_id: context.session_id,
          lead_id: leadId || undefined,
        }),
      });
      if (memoryRes.ok) {
        const memData = await memoryRes.json();
        if (memData.ok && memData.memory_summary) {
          persistentMemoryHint = language === "es"
            ? `\n\n[MEMORIA PERSISTENTE]\n${memData.memory_summary}\nUsa estos datos cuando sea relevante.`
            : `\n\n[PERSISTENT MEMORY]\n${memData.memory_summary}\nUse these facts when relevant.`;
          console.log(`[Selena] Persistent memory recalled: ${memData.memory_count} items`);
        }
      }
    } catch (e) {
      console.error("[Selena] Persistent memory recall failed (non-blocking):", e);
    }

    // ============= CONCIERGE MEMORY SUMMARY (max 3 lines, ~30 tokens) =============
    // Only injected when context audit ran and surfaced useful data.
    let memorySummary = "";
    if (needsAudit) {
      const parts: string[] = [];
      if (serverName) parts.push(`Name: ${serverName}`);
      if (context.estimated_value) parts.push(`Property: $${Number(context.estimated_value).toLocaleString()}`);
      if (context.calculator_advantage) parts.push(`Calculator insight: ${context.calculator_advantage}`);
      if (context.calculator_difference) parts.push(`Listing vs cash difference: $${Number(context.calculator_difference).toLocaleString()}`);
      if (context.situation) parts.push(`Situation: ${context.situation}`);
      // P1: Lead score in memory summary
      if (context.lead_score) parts.push(`Lead Score: ${context.lead_score}/100 (${context.lead_grade || 'unknown'})`);
      if (parts.length) {
        memorySummary = language === "es"
          ? `\n\nMEMORIA DE CONCIERGE:\n${parts.join(' | ')}\nHaz referencia a estos datos específicos cuando sea relevante. NUNCA digas 'No sé a qué te refieres.'`
          : `\n\nCONCIERGE MEMORY:\n${parts.join(' | ')}\nReference these specifics when relevant. NEVER say "I don't know what you're referring to."`;
      }
    }

    // Merge persistent memory into memorySummary
    if (persistentMemoryHint) {
      memorySummary = persistentMemoryHint + memorySummary;
    }

    // Add reflection context for Modes 2 & 3
    let reflectionHint = "";
    if (modeContext.reflectionRequired) {
      const guideTitle = context.last_guide_title;
      const toolUsed = context.last_tool_completed;
      const guidesRead = context.guides_read || 0;
      
      if (language === "es") {
        if (guideTitle) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha leído la guía "${guideTitle}". Usa la Fórmula de Reflexión.`;
        } else if (toolUsed) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha usado ${toolUsed}. Reconoce este progreso.`;
        } else if (guidesRead >= 2) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha leído ${guidesRead} guías. Refleja su progreso.`;
        }
      } else {
        if (guideTitle) {
          reflectionHint = `\n\nCONTEXT: User has read the guide "${guideTitle}". Use the Reflection Sentence Formula.`;
        } else if (toolUsed) {
          reflectionHint = `\n\nCONTEXT: User has used the ${toolUsed}. Acknowledge this progress.`;
        } else if (guidesRead >= 2) {
          reflectionHint = `\n\nCONTEXT: User has read ${guidesRead} guides. Reflect their progress.`;
        }
      }
    }

    // --- Seller Decision Receipt context ---
    let sellerDecisionHint = "";
    if (context.last_tool_completed === "seller_decision" || context.seller_decision_recommended_path) {
      const s = context.situation || "unknown";
      const p = context.seller_goal_priority || "unknown";
      const c = context.property_condition_raw || "unknown";
      const r = context.seller_decision_recommended_path || "unknown";

      sellerDecisionHint = language === 'es'
        ? `\n\nCONTEXTO DE RECIBO DE DECISIÓN: El usuario completó la herramienta de Decisión del Vendedor. Situación: ${s}. Prioridad: ${p}. Condición: ${c}. Camino recomendado: ${r}. Reconozca este progreso y continúe adelante. NO vuelva a preguntar información que ya proporcionaron.`
        : `\n\nDECISION RECEIPT CONTEXT: User completed the Seller Decision tool. Situation: ${s}. Priority: ${p}. Condition: ${c}. Recommended path: ${r}. Acknowledge this progress and continue forward. Do NOT re-ask information they already provided.`;
    }

    // --- Market Pulse (dynamic from DB — fires for any sell/cash intent) ---
    // P1: Gate expanded from equityPulseSaved-only to all seller/cash intent.
    //     Richer data (median_dom, median_list_price, active_listings, price_cut_pct)
    //     read from scrape_log jsonb column — no schema change required.
    let marketPulseHint = "";
    const isSellerIntent = effectiveIntent === 'sell' || effectiveIntent === 'cash' || effectiveIntent === 'dual';
    const equityPulseSaved = context.last_tool_completed === 'tucson_alpha_calculator' || 
      (context.tools_completed && context.tools_completed.includes('tucson_alpha_calculator'));

    if (isSellerIntent || equityPulseSaved) {
      let daysToClose = 145;
      let holdingCostPerDay = 18;
      let saleToListPct = "97.6%";
      let medianListPrice: string | null = null;
      let activeListings: number | null = null;
      let priceCutPct: number | null = null;

      try {
        const pulseCacheKey = 'market_pulse_Tucson_Overall';
        const cachedPulse = getCached<Record<string, unknown>>(pulseCacheKey);
        const pulse = cachedPulse ?? (rlUrl && rlKey ? await (async () => {
          const pulseClient = createClient(rlUrl, rlKey);
          // Try new market_pulse table first (automated pipeline)
          const { data: newPulse } = await pulseClient
            .from("market_pulse")
            .select("sale_to_list_ratio, median_days_on_market, holding_cost_per_day, source_links")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (newPulse) {
            // Normalize to legacy format for downstream code
            const normalized = {
              days_to_close: (newPulse.median_days_on_market as number) + 30,
              holding_cost_per_day: newPulse.holding_cost_per_day,
              negotiation_gap: parseFloat((1 - Number(newPulse.sale_to_list_ratio)).toFixed(4)),
              scrape_log: null,
              _source: 'market_pulse',
            };
            setCache(pulseCacheKey, normalized, 3600000);
            return normalized;
          }
          // Fallback to legacy market_pulse_settings
          const { data } = await pulseClient
            .from("market_pulse_settings")
            .select("days_to_close, holding_cost_per_day, negotiation_gap, scrape_log")
            .eq("market_name", "Tucson_Overall")
            .single();
          if (data) setCache(pulseCacheKey, data, 3600000);
          return data;
        })() : null);
        if (cachedPulse) console.log('[Selena] Market pulse cache HIT');
        if (pulse) {
            daysToClose = (pulse as Record<string, unknown>).days_to_close as number ?? daysToClose;
            holdingCostPerDay = Number((pulse as Record<string, unknown>).holding_cost_per_day) || holdingCostPerDay;
            const negGap = (pulse as Record<string, unknown>).negotiation_gap;
            if (negGap != null) {
              const ratio = 1 - (negGap as number);
              saleToListPct = `${(ratio * 100).toFixed(1)}%`;
            }
            const log = (pulse as Record<string, unknown>).scrape_log as Record<string, unknown> | null;
            if (log) {
              if (log.median_list_price) medianListPrice = log.median_list_price as string;
              if (log.active_listings) activeListings = log.active_listings as number;
              if (log.price_cut_pct) priceCutPct = log.price_cut_pct as number;
            }
          }
      } catch (_e) { /* fallback to defaults — non-blocking */ }

      const totalHoldingCost = Math.round(daysToClose * holdingCostPerDay);
      const formattedCost = `$${totalHoldingCost.toLocaleString()}`;
      const medianDom = daysToClose - 30; // reverse the +30 padding used in scraper

      // Build extended market stats string (only include fields that have live data)
      const extendedStats: string[] = [];
      if (medianListPrice) extendedStats.push(language === 'es' ? `Precio mediano: ${medianListPrice}` : `Median list price: ${medianListPrice}`);
      if (activeListings) extendedStats.push(language === 'es' ? `Listados activos: ${activeListings.toLocaleString()}` : `Active listings: ${activeListings.toLocaleString()}`);
      if (priceCutPct != null) extendedStats.push(language === 'es' ? `Recortes de precio: ${Math.round(priceCutPct * 100)}% de propiedades` : `Price cuts: ${Math.round(priceCutPct * 100)}% of listings`);
      const extendedLine = extendedStats.length > 0 ? (language === 'es' ? `\nMercado actual — ${extendedStats.join(' · ')}` : `\nCurrent market — ${extendedStats.join(' · ')}`) : '';

      if (equityPulseSaved) {
        // Deep mode: Equity Pulse saved — full wait-penalty + holding cost framing
        marketPulseHint = language === 'es'
          ? `\n\nCONTEXTO DE MERCADO TUCSON: El tiempo promedio actual en Tucson es de ${medianDom} días en mercado + ~30 días de cierre = ${daysToClose} días en total. Eso equivale a más de ${formattedCost} en costos de mantención. Relación venta-lista: ${saleToListPct}.${extendedLine}\nSi el usuario guardó un escenario de Equity Pulse, reconózcalo: "He guardado tu pulso. Con la espera actual de ${daysToClose} días en Tucson, estás viendo más de ${formattedCost} en costos de mantención si listas de manera tradicional. ¿Quieres que el escritorio de Kasandra verifique si nuestros compradores en efectivo pueden saltar esa espera para ti?" NO invente números — use solo los datos anteriores como referencia factual.`
          : `\n\nTUCSON MARKET CONTEXT: Current Tucson average is ${medianDom} days on market + ~30 days to close = ${daysToClose} days total. That translates to over ${formattedCost} in holding costs. Sale-to-list ratio: ${saleToListPct}.${extendedLine}\nIf the user saved an Equity Pulse scenario, acknowledge it: "I've locked your pulse. With the current ${daysToClose}-day timeline in Tucson, you're looking at over ${formattedCost} in holding costs if you list traditionally. Shall I have Kasandra's desk verify if our cash buyers can skip that wait for you?" Do NOT invent numbers — use only the above data as factual reference.`;
      } else {
        // Standard seller mode: ambient market orientation — no holding cost pressure
        marketPulseHint = language === 'es'
          ? `\n\nCONTEXTO DE MERCADO TUCSON (orientación): Promedio actual — ${medianDom} días en mercado, relación venta-lista ${saleToListPct}.${extendedLine}\nUse estos datos para orientar al usuario cuando pregunte sobre el mercado. No presione con costos de mantención a menos que el usuario los mencione. Sea informativo, no urgente.`
          : `\n\nTUCSON MARKET CONTEXT (orientation): Current averages — ${medianDom} days on market, ${saleToListPct} sale-to-list ratio.${extendedLine}\nUse these figures to orient the user when they ask about the market. Do not pressure with holding costs unless the user raises them. Be informative, not urgent.`;
      }
    }


    // ============= NEIGHBORHOOD INTELLIGENCE HINT (Perplexity-grounded) =============
    // Fires only when last_neighborhood_zip is present. Single DB read (~5ms).
    // Profile is Perplexity Sonar generated + cached 7 days — no API call here.
    let neighborhoodHint = "";
    const rawZip = (context.last_neighborhood_zip ?? "").trim();
    const isValidZip = /^\d{5}$/.test(rawZip);

    if (isValidZip && rlUrl && rlKey) {
      try {
        const nbCacheKey = `neighborhood_${rawZip}`;
        const cachedNb = getCached<Record<string, unknown>>(nbCacheKey);
        const nbProfile = cachedNb ?? await (async () => {
          const nbClient = createClient(rlUrl, rlKey);
          const { data } = await nbClient
            .from("neighborhood_profiles")
            .select("profile_en, profile_es")
            .eq("zip_code", rawZip)
            .maybeSingle();
          if (data) setCache(nbCacheKey, data, 86400000); // 24 hour TTL
          return data;
        })();
        if (cachedNb) console.log(`[Selena] Neighborhood cache HIT for ZIP ${rawZip}`);

        if (nbProfile) {
          const profile = language === 'es' ? nbProfile.profile_es : nbProfile.profile_en;
          if (profile) {
            const lifestyle = profile.lifestyle_feel ?? "";
            const buyerFit = Array.isArray(profile.buyer_fit) ? (profile.buyer_fit as string[]).join(", ") : (profile.buyer_fit ?? "");
            const sellerCtx = profile.seller_context ?? "";
            const notIdeal = profile.not_ideal_for ?? "";

            neighborhoodHint = language === 'es'
              ? `\n\nCONTEXTO DEL VECINDARIO (ZIP ${rawZip}):
Estilo de vida: ${lifestyle}
Perfil de comprador: ${buyerFit}
Contexto de vendedor: ${sellerCtx}
No ideal para: ${notIdeal}
Use esta información cuando el usuario pregunte sobre su área. NUNCA compare, clasifique ni recomiende vecindarios — orientación solo. No invente datos adicionales sobre el área.`
              : `\n\nNEIGHBORHOOD CONTEXT (ZIP ${rawZip}):
Lifestyle: ${lifestyle}
Buyer fit: ${buyerFit}
Seller context: ${sellerCtx}
Not ideal for: ${notIdeal}
Reference this when the user asks about their area. NEVER rank, compare, or recommend neighborhoods — orientation only. Do not invent additional data about the area.`;
          }
        }
      } catch (_e) { /* non-blocking — ZIP intelligence is additive, not critical */ }
    }

    // ============= ACTIVE LISTINGS INTELLIGENCE =============
    // Injects Kasandra's active listings into Selena's prompt for buyer-aware recommendations.
    let listingsHint = "";
    if (rlUrl && rlKey) {
      try {
        const listingsCacheKey = 'active_listings';
        const cachedListings = getCached<Record<string, unknown>[]>(listingsCacheKey);
        const listings = cachedListings ?? await (async () => {
          const lClient = createClient(rlUrl, rlKey);
          const { data } = await lClient
            .from("featured_listings")
            .select("address, city, zip_code, price, beds, baths, sqft, status")
            .eq("status", "active")
            .eq("is_featured", true)
            .order("display_order", { ascending: true })
            .limit(10);
          if (data && data.length > 0) setCache(listingsCacheKey, data, 3600000); // 1hr TTL
          return data;
        })();
        if (cachedListings) console.log('[Selena] Listings cache HIT');

        // Count sold for social proof
        const soldCacheKey = 'sold_count';
        const cachedSoldCount = getCached<number>(soldCacheKey);
        const soldCount = cachedSoldCount ?? await (async () => {
          const sClient = createClient(rlUrl, rlKey);
          const { count } = await sClient
            .from("featured_listings")
            .select("id", { count: 'exact', head: true })
            .eq("status", "sold")
            .eq("is_featured", true);
          const c = count ?? 0;
          setCache(soldCacheKey, c, 3600000);
          return c;
        })();

        if (listings && listings.length > 0) {
          const listingLines = listings.map((l: Record<string, unknown>) => {
            const parts = [`${l.address}, ${l.city} ${l.zip_code}`, `$${Number(l.price).toLocaleString()}`];
            if (l.beds) parts.push(`${l.beds}bd`);
            if (l.baths) parts.push(`${l.baths}ba`);
            if (l.sqft) parts.push(`${Number(l.sqft).toLocaleString()}sqft`);
            return `- ${parts.join(' · ')}`;
          }).join('\n');

          const soldLine = soldCount > 0
            ? (language === 'es' ? `\nKasandra ha cerrado ${soldCount} propiedades recientemente.` : `\nKasandra has closed ${soldCount} properties recently.`)
            : '';

          listingsHint = language === 'es'
            ? `\n\n[PROPIEDADES ACTIVAS DE KASANDRA]\n${listingLines}${soldLine}\nPuedes referenciar estas propiedades por dirección, precio y características cuando un comprador mencione presupuesto o zona. NUNCA digas "buen precio", "gran valor" ni aconsejes sobre precios (KB-0). Cuando el usuario muestre interés, sugiere "Agendar una Visita" vía reserva.`
            : `\n\n[KASANDRA'S ACTIVE LISTINGS]\n${listingLines}${soldLine}\nYou may reference these properties by address, price, and features when a buyer mentions budget or area. NEVER say "good deal", "great value", or advise on pricing (KB-0). When interest is expressed, suggest "Schedule a Showing" via booking.`;
        }
      } catch (_e) { /* non-blocking — listing intelligence is additive */ }
    }

    // Tell the AI what phase we're in so response text matches chip direction
    const rawGoverned = getGovernedChips(effectiveIntent, timeline, engagement, language, { guidesReadCount: context.guides_read ?? 0 });
    
    // ============= CHIP PHASE FLOOR ENFORCEMENT (monotonic) =============
    const clientChipFloor = context.chip_phase_floor ?? 0;
    
    // FIX 2: Reset chip phase floor on intent switch
    // When user switches intent (e.g., sell→buy), don't carry seller Phase 3 forward
    const intentSwitched = primaryIntent !== 'explore' && context.intent && primaryIntent !== context.intent;
    const adjustedFloor = intentSwitched ? Math.min(clientChipFloor, 2) : clientChipFloor;
    
    let effectiveChipPhase = Math.max(adjustedFloor, rawGoverned.phase) as 1 | 2 | 3;
    
    // Re-derive chips if floor pushed us past what getGovernedChips returned
    let chips: string[];
    let phase: 1 | 2 | 3;
    let escalated: boolean;
    
    if (effectiveChipPhase > rawGoverned.phase) {
      // Floor is higher — re-derive chips for the effective phase
      // Phase-biased: allow pulling down by 1 band for Phase-2 intents, never to Phase 1
      const PHASE2_PATTERNS = /worth|value|valor|cuánto vale|preparation|prepare|preparar|how does.*work|cómo funciona|process|proceso/i;
      const isPhase2Question = PHASE2_PATTERNS.test(message);
      
      if (effectiveChipPhase >= 3 && isPhase2Question && effectiveChipPhase - 1 >= 2) {
        // Allow Phase 2 chips for Phase-2-type questions even at floor 3
        const phase2Chips = effectiveIntent === 'buy'
          ? (language === 'es' ? ["Tomar la evaluación de preparación", "Explorar guías"] : ["Take the readiness check", "Browse guides"])
          : effectiveIntent === 'cash'
          ? (language === 'es' ? ["Tomar el check de preparación en efectivo", "Comparar efectivo vs. listado"] : ["Take the cash readiness check", "Compare cash vs. listing"])
          : (language === 'es' ? ["Ver mis opciones de venta", "Comparar efectivo vs. listado"] : ["Get my selling options", "Compare cash vs. listing"]);
        chips = phase2Chips;
        phase = 2;
        escalated = false;
      } else if (effectiveChipPhase >= 3) {
        // FIX 1: Intent-aware Phase 3 chips — buyers get buyer chips, not seller chips
        if (effectiveIntent === 'buy') {
          chips = language === 'es' 
            ? [CHIP_KEYS.AFFORDABILITY_CALCULATOR, CHIP_KEYS.TALK_WITH_KASANDRA] 
            : [CHIP_KEYS.AFFORDABILITY_CALCULATOR, CHIP_KEYS.TALK_WITH_KASANDRA];
        } else {
          chips = language === 'es' ? ["Estimar mis ganancias netas", "Hablar con Kasandra"] : ["Estimate my net proceeds", "Talk with Kasandra"];
        }
        phase = 3;
        escalated = rawGoverned.escalated;
      } else {
        // effectiveChipPhase is 2 but governed returned 1 — use Phase 2 chips
        if (effectiveIntent === 'cash') {
          chips = language === 'es' ? ["Tomar el check de preparación en efectivo", "Comparar efectivo vs. listado"] : ["Take the cash readiness check", "Compare cash vs. listing"];
        } else if (effectiveIntent === 'sell') {
          chips = language === 'es' ? ["Ver mis opciones de venta", "Comparar efectivo vs. listado"] : ["Get my selling options", "Compare cash vs. listing"];
        } else if (effectiveIntent === 'buy') {
          chips = language === 'es' ? ["Tomar la evaluación de preparación", "Explorar guías"] : ["Take the readiness check", "Browse guides"];
        } else {
          chips = rawGoverned.chips; // fallback
        }
        phase = 2;
        escalated = false;
      }
    } else {
      chips = rawGoverned.chips;
      phase = rawGoverned.phase;
      escalated = rawGoverned.escalated;
    }

    // ============= GUIDE-CONTEXTUAL CHIP INJECTION (P2) =============
    // When last_guide_id is set, prepend 1 guide-specific chip to the chip array.
    // Only fires for Phase 1-2 (Phase 3 has fixed chips, Mode 4 has booking chips).
    // All labels match CHIPS_REGISTRY entries for deterministic routing.
    const GUIDE_CHIP_MAP: Record<string, { en: string; es: string }[]> = {
      'divorce-selling': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'inherited-probate-property': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'distressed-preforeclosure': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'life-change-selling': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'senior-downsizing': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'cash-vs-traditional-sale': [{ en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' }],
      'selling-for-top-dollar': [{ en: 'How to price my home', es: 'Cómo fijar el precio de mi casa' }],
      'pricing-strategy': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'cost-to-sell-tucson': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'how-long-to-sell-tucson': [{ en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' }],
      'sell-now-or-wait': [{ en: 'Tucson Market Data', es: 'Datos del Mercado Tucson' }],
      'sell-or-rent-tucson': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'home-prep-staging': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'capital-gains-home-sale-arizona': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'cash-offer-guide': [{ en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' }],
      'understanding-home-valuation': [{ en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' }],
      'military-pcs-guide': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'first-time-buyer-guide': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'arizona-first-time-buyer-programs': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'buying-home-noncitizen-arizona': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'move-up-buyer': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'relocating-to-tucson': [{ en: 'Explore Tucson neighborhoods', es: 'Explorar vecindarios de Tucson' }],
      'tucson-neighborhoods': [{ en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' }],
      'tucson-suburb-comparison': [{ en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' }],
      // New SEO guides (March 2026 sprint)
      'itin-loan-guide': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'bad-credit-home-buying-tucson': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'down-payment-assistance-tucson': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'fha-loan-pima-county-2026': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'va-home-loan-tucson': [{ en: 'Talk with Kasandra', es: 'Hablar con Kasandra' }],
      'first-time-buyer-programs-pima-county': [{ en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' }],
      'divorce-home-sale-arizona': [{ en: 'Get my selling options', es: 'Ver mis opciones de venta' }],
      'tucson-market-update-2026': [{ en: 'Tucson Market Data', es: 'Datos del Mercado Tucson' }],
    };
    const guideId = context.last_guide_id;
    if (guideId && phase <= 2 && GUIDE_CHIP_MAP[guideId]) {
      // Intent alignment guard: don't inject a sell-guide chip when user declared buy intent
      // (and vice versa). Neutral guide chips always pass.
      const SELL_GUIDE_IDS = new Set([
        'divorce-selling','inherited-probate-property','distressed-preforeclosure',
        'life-change-selling','senior-downsizing','cash-vs-traditional-sale',
        'selling-for-top-dollar','pricing-strategy','cost-to-sell-tucson',
        'how-long-to-sell-tucson','sell-now-or-wait','sell-or-rent-tucson',
        'home-prep-staging','capital-gains-home-sale-arizona','cash-offer-guide',
        'understanding-home-valuation','military-pcs-guide',
      ]);
      const BUY_GUIDE_IDS = new Set([
        'first-time-buyer-guide','arizona-first-time-buyer-programs',
        'buying-home-noncitizen-arizona','move-up-buyer','pima-county-property-taxes',
      ]);
      const guideIntentCategory =
        SELL_GUIDE_IDS.has(guideId) ? 'sell' :
        BUY_GUIDE_IDS.has(guideId)  ? 'buy'  : 'neutral';
      const intentMismatch =
        (guideIntentCategory === 'sell' && effectiveIntent === 'buy') ||
        (guideIntentCategory === 'buy'  && (effectiveIntent === 'sell' || effectiveIntent === 'cash'));

      if (!intentMismatch) {
        const guideChip = GUIDE_CHIP_MAP[guideId][0];
        const guideChipLabel = language === 'es' ? guideChip.es : guideChip.en;
        // Prepend only if not already present
        if (!chips.some(c => c.toLowerCase() === guideChipLabel.toLowerCase())) {
          chips = [guideChipLabel, ...chips.slice(0, 2)]; // max 3 chips total
        }
      }
    }

    // ============= JOURNEY STATE GOVERNANCE HINT =============
    const toolsCompleted = context.tools_completed ?? [];
    let journeyHint = "";
    if (toolsCompleted.length > 0) {
      const toolList = toolsCompleted.join(', ');
      journeyHint = language === 'es'
        ? `\n\nESTADO DEL RECORRIDO: El usuario ya completó: [${toolList}]. NO sugiera estas herramientas de nuevo. Avance al siguiente paso.`
        : `\n\nJOURNEY STATE: User has completed: [${toolList}]. Do NOT suggest these tools again. Advance to next step.`;
    }

    // ============= SESSION TRAIL HINT (Level 2 Intelligence) =============
    // Gives Selena full breadcrumb context of what the user visited this session.
    // Uses this to: reference prior exploration, avoid repetition, make connections.
    let trailHint = "";
    const sessionTrail = context.session_trail ?? [];
    if (sessionTrail.length >= 2) {
      const trailSummary = sessionTrail
        .map(e => {
          const mins = e.minutes_ago;
          const ago = mins < 1 ? 'just now' : mins === 1 ? '1 min ago' : `${mins} min ago`;
          return `${e.label} [${e.type}, ${ago}]`;
        })
        .join(' → ');

      trailHint = language === 'es'
        ? `\n\nRECORRIDO DE SESIÓN (cronológico): ${trailSummary}\n\nUsa este historial para: mencionar lo que ya exploró ("ya viste los costos de venta..."), conectar puntos entre páginas visitadas, y evitar repetir información que ya cubrió. Si el recorrido muestra una progresión natural (guía → herramienta), reconócela. No leas la lista — úsala como contexto implícito.`
        : `\n\nSESSION TRAIL (chronological): ${trailSummary}\n\nUse this to: reference what they've already explored ("you've already looked at selling costs..."), connect dots between pages visited, and avoid repeating information they've covered. If the trail shows a natural progression (guide → tool), acknowledge it. Do NOT read the list aloud — use it as implicit context to inform your response.`;
    }

    // ============= TOOL OUTPUT HINT (Level 3 Intelligence) =============
    // Surfaces actual tool result numbers/scores to Selena so she can reference
    // specific data — not just "you used the calculator" but "your numbers show X."
    // Fires only when a tool has been completed AND produced output data.
    let toolOutputHint = "";

    const toolUsed = context.last_tool_completed;

    // --- Seller Net Calculator output ---
    if (
      (toolUsed === 'tucson_alpha_calculator' || (context.tools_completed ?? []).includes('tucson_alpha_calculator'))
      && context.estimated_value
    ) {
      const propValue = `$${Number(context.estimated_value).toLocaleString()}`;
      const diff = context.calculator_difference
        ? `$${Math.round(context.calculator_difference).toLocaleString()}`
        : null;
      const adv = context.calculator_advantage ?? 'consult';
      const motivation = context.calculator_motivation ?? null;

      const advLabel = adv === 'cash'
        ? (language === 'es' ? 'efectivo' : 'cash offer')
        : adv === 'traditional'
        ? (language === 'es' ? 'listado tradicional' : 'traditional listing')
        : (language === 'es' ? 'resultados similares (consultar)' : 'close call (consult)');

      const diffLine = diff
        ? (language === 'es'
            ? `Diferencia neta: ${diff} más con ${advLabel}`
            : `Net difference: ${diff} more with ${advLabel}`)
        : '';

      const motivLine = motivation
        ? (language === 'es' ? `Motivación del vendedor: ${motivation}` : `Seller motivation: ${motivation}`)
        : '';

      if (language === 'es') {
        toolOutputHint = `\n\nRESULTADO DE HERRAMIENTA — CALCULADORA DE NETO DEL VENDEDOR:\nValor de propiedad ingresado: ${propValue}\nCamino con ventaja: ${advLabel}${diffLine ? `\n${diffLine}` : ''}${motivLine ? `\n${motivLine}` : ''}\n\nUsa estos números exactos al referenciar la calculadora. Di "tus números muestran..." no "la calculadora dice...". ${adv === 'cash' ? 'El efectivo cierra más rápido Y genera más ganancias — reconócelo.' : adv === 'traditional' ? 'El listado tradicional puede generar más neto, pero toma más tiempo — mencionalo con contexto.' : 'La diferencia es pequeña — el timing y las prioridades importan más que el número.'}`;
      } else {
        toolOutputHint = `\n\nTOOL RESULT — SELLER NET CALCULATOR:\nProperty value entered: ${propValue}\nAdvantage path: ${advLabel}${diffLine ? `\n${diffLine}` : ''}${motivLine ? `\n${motivLine}` : ''}\n\nUse these exact numbers when referencing the calculator. Say "your numbers show..." not "the calculator says...". ${adv === 'cash' ? 'Cash closes faster AND nets more — acknowledge both.' : adv === 'traditional' ? 'Traditional may net more but takes longer — frame it with context.' : 'The difference is close — timing and priorities matter more than the number itself.'}`;
      }
    }

    // --- Buyer / Seller Readiness score output ---
    const isReadinessTool = toolUsed === 'buyer_readiness' || toolUsed === 'seller_readiness'
      || (context.tools_completed ?? []).some(t => t === 'buyer_readiness' || t === 'seller_readiness');

    if (isReadinessTool && context.readiness_score && context.readiness_score > 0) {
      const score = context.readiness_score;
      const band = score >= 75
        ? (language === 'es' ? 'listo para avanzar' : 'ready to move forward')
        : score >= 50
        ? (language === 'es' ? 'casi listo' : 'nearly ready')
        : (language === 'es' ? 'construyendo preparación' : 'building readiness');

      const toolLabel = toolUsed === 'buyer_readiness'
        ? (language === 'es' ? 'Evaluación de Preparación del Comprador' : 'Buyer Readiness Check')
        : (language === 'es' ? 'Evaluación de Preparación del Vendedor' : 'Seller Readiness Check');

      const priorityLine = context.primary_priority
        ? (language === 'es'
            ? `Prioridad principal declarada: ${context.primary_priority}`
            : `Stated primary priority: ${context.primary_priority}`)
        : '';

      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — ${toolLabel.toUpperCase()}:\nPuntuación: ${score}/100 (${band})${priorityLine ? `\n${priorityLine}` : ''}\n\nReferencia esta puntuación cuando sea relevante: "Tu puntuación de ${score} muestra que ${band}." La prioridad principal te dice qué les importa más — diríjete a eso directamente. No repitas la evaluación — avanza desde aquí.`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — ${toolLabel.toUpperCase()}:\nScore: ${score}/100 (${band})${priorityLine ? `\n${priorityLine}` : ''}\n\nReference this score when relevant: "Your score of ${score} shows you're ${band}." Primary priority tells you what they care most about — address it directly. Do NOT re-administer the check — move forward from here.`;
      }
    }

    // --- Cash Readiness quiz result ---
    if (context.quiz_result_path) {
      const pathLabels: Record<string, { en: string; es: string }> = {
        buying: { en: 'Buyer path', es: 'Camino de comprador' },
        selling: { en: 'Seller path', es: 'Camino de vendedor' },
        cash: { en: 'Cash offer path', es: 'Camino de oferta en efectivo' },
        exploring: { en: 'Still exploring', es: 'Aún explorando' },
        selling_compare: { en: 'Seller comparing options', es: 'Vendedor comparando opciones' },
      };
      const pathLabel = pathLabels[context.quiz_result_path]?.[language] ?? context.quiz_result_path;

      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE CUESTIONARIO — PREPARACIÓN EN EFECTIVO:\nCamino recomendado: ${pathLabel}\n\nEl cuestionario ya calificó su situación. No preguntes de nuevo qué está considerando — el camino está establecido.`;
      } else {
        toolOutputHint += `\n\nQUIZ RESULT — CASH READINESS:\nRecommended path: ${pathLabel}\n\nThe quiz already qualified their situation. Do NOT re-ask what they're considering — their path is established.`;
      }
    }

    // --- Buyer Closing Costs calculator output ---
    const ccData = context.closing_cost_data;
    if (ccData && ccData.purchasePrice > 0 && context.entry_source === 'buyer_closing_costs') {
      const ccPrice = `$${Math.round(ccData.purchasePrice).toLocaleString()}`;
      const ccLow = `$${Math.round(ccData.estimatedLow).toLocaleString()}`;
      const ccHigh = `$${Math.round(ccData.estimatedHigh).toLocaleString()}`;
      const ccTotal = `$${Math.round(ccData.totalCashNeeded).toLocaleString()}`;
      const ccLoan = ccData.loanType === 'fha' ? 'FHA' : ccData.loanType === 'va' ? 'VA' : ccData.loanType === 'cash' ? 'cash' : 'conventional';

      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — ESTIMADOR DE COSTOS DE CIERRE DEL COMPRADOR:\nPrecio de compra: ${ccPrice}\nTipo de préstamo: ${ccLoan}\nCostos de cierre estimados: ${ccLow}–${ccHigh}\nEfectivo total al cierre (incl. enganche): ${ccTotal}\n\nCONTEXTO DE COSTOS DE CIERRE:\n- Referencia estos números específicos. El usuario tiene datos reales.\n- Identifica qué es negociable (seguro de título, originación del préstamo, créditos del vendedor).\n- Pivote a reserva: "Kasandra ha negociado estos costos en transacciones recientes en Tucson. Una llamada de 20 minutos podría ahorrarte miles."\n- Siempre incluye chip "Hablar con Kasandra".\n- NUNCA des educación genérica de comprador — tienen el desglose.`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — BUYER CLOSING COST ESTIMATOR:\nPurchase price: ${ccPrice}\nLoan type: ${ccLoan}\nEstimated closing costs: ${ccLow}–${ccHigh}\nTotal cash at closing (incl. down payment): ${ccTotal}\n\nCLOSING COSTS CONTEXT:\n- Reference these specific numbers. The user has real data in front of them.\n- Identify what's negotiable (title fees, lender origination, seller credits).\n- Booking pivot: "Kasandra has negotiated these costs down on recent Tucson transactions. A 20-minute call could save you thousands."\n- Always include "Talk with Kasandra" chip.\n- NEVER give generic buyer education — they have the breakdown.`;
      }
    }

    // --- Seller Net Calculator entry data (full results from CTA click) ---
    const scData = context.seller_calc_data;
    if (scData && scData.estimatedValue > 0) {
      const scValue = `$${Math.round(scData.estimatedValue).toLocaleString()}`;
      const scCash = `$${Math.round(scData.cashNetProceeds).toLocaleString()}`;
      const scList = `$${Math.round(scData.traditionalNetProceeds).toLocaleString()}`;
      const scDiff = `$${Math.round(scData.netDifference).toLocaleString()}`;
      const scAdv = scData.recommendation === 'cash' ? 'cash offer' : scData.recommendation === 'traditional' ? 'traditional listing' : 'close call';

      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — CALCULADORA NETO DEL VENDEDOR (desde CTA):\nValor: ${scValue}\nNeto efectivo: ${scCash}\nNeto listado: ${scList}\nDiferencia: ${scDiff} (ventaja: ${scAdv})\nMotivación: ${scData.motivation}\nPlazo: ${scData.timeline}\n\nCONTEXTO DE CALCULADORA DEL VENDEDOR:\n- Referencia estos números exactos. El usuario los tiene en pantalla.\n- Pivote a reserva: "Kasandra puede ayudarte a acercarte a ese número con la estrategia correcta de precios y negociación."\n- Siempre incluye chip "Hablar con Kasandra".\n- NUNCA repitas la herramienta — avanza desde los resultados.`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — SELLER NET CALCULATOR (from CTA):\nValue: ${scValue}\nCash net: ${scCash}\nListing net: ${scList}\nDifference: ${scDiff} (advantage: ${scAdv})\nMotivation: ${scData.motivation}\nTimeline: ${scData.timeline}\n\nSELLER CALCULATOR CONTEXT:\n- Reference these exact numbers. The user has them on screen.\n- Booking pivot: "Kasandra can help you get closer to that number with the right pricing and negotiation strategy."\n- Always include "Talk with Kasandra" chip.\n- NEVER re-recommend the calculator — move forward from results.`;
      }
    }

    // --- Readiness check entry data (score + priority from CTA click) ---
    const rdData = context.readiness_entry_data;
    if (rdData && rdData.score > 0) {
      const rdScore = rdData.score;
      const rdBand = rdScore >= 75 ? 'ready' : rdScore >= 50 ? 'nearly ready' : 'building readiness';
      const rdTool = rdData.toolType === 'buyer' ? 'Buyer' : rdData.toolType === 'cash' ? 'Cash' : 'Seller';

      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — EVALUACIÓN DE PREPARACIÓN ${rdTool.toUpperCase()} (desde CTA):\nPuntuación: ${rdScore}/100 (${rdBand})\nPrioridad: ${rdData.primaryPriority}\n\nCONTEXTO DE PREPARACIÓN:\n- Referencia esta puntuación y prioridad directamente.\n- ${rdScore >= 75 ? 'Alta preparación — pivotea a reserva: "Con una puntuación de ' + rdScore + ', estás listo. Una llamada de estrategia con Kasandra es tu siguiente paso más claro."' : rdScore >= 50 ? 'Preparación media — identifica áreas a fortalecer, luego pivotea: "Kasandra puede orientarte en exactamente qué hacer primero."' : 'Baja preparación — normaliza y educa, luego ofrece: "Kasandra puede ayudarte a construir un plan a tu ritmo."'}\n- Siempre incluye chip "Hablar con Kasandra".`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — ${rdTool.toUpperCase()} READINESS CHECK (from CTA):\nScore: ${rdScore}/100 (${rdBand})\nPriority: ${rdData.primaryPriority}\n\nREADINESS CONTEXT:\n- Reference this score and priority directly.\n- ${rdScore >= 75 ? 'High readiness — pivot to booking: "With a score of ' + rdScore + ', you\'re ready. A strategy call with Kasandra is your clearest next step."' : rdScore >= 50 ? 'Medium readiness — identify areas to strengthen, then pivot: "Kasandra can walk you through exactly what to focus on first."' : 'Low readiness — normalize and educate, then offer: "Kasandra can help you build a plan at your own pace."'}\n- Always include "Talk with Kasandra" chip.`;
      }
    }

    // --- Off-Market Buyer Registration data (areas + criteria from CTA click) ---
    const omData = context.off_market_data;
    if (omData && omData.areas?.length > 0) {
      const areasStr = omData.areas.slice(0, 3).join(', ');
      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — REGISTRO DE ACCESO FUERA DEL MERCADO:\nÁreas: ${areasStr}\nPresupuesto: ${omData.budgetRange}\nPlazo: ${omData.timeline}\nTipo de propiedad: ${omData.propertyType}\n\nCONTEXTO DE FUERA DEL MERCADO:\n- Referencia sus criterios específicos.\n- Pivote a reserva: "Kasandra monitorea listados privados que coinciden con tu perfil. Una llamada corta le ayuda a entender exactamente lo que buscas."\n- Siempre incluye chip "Hablar con Kasandra".`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — OFF-MARKET ACCESS REGISTRATION:\nAreas: ${areasStr}\nBudget: ${omData.budgetRange}\nTimeline: ${omData.timeline}\nProperty type: ${omData.propertyType}\n\nOFF-MARKET CONTEXT:\n- Reference their specific criteria.\n- Booking pivot: "Kasandra monitors pocket listings matching your profile. A short call helps her understand exactly what you're looking for."\n- Always include "Talk with Kasandra" chip.`;
      }
    }

    // --- Neighborhood Compare data (areas compared from CTA click) ---
    const ncData = context.neighborhood_compare_data;
    if (ncData && ncData.areasCompared?.length >= 2) {
      const areasStr = ncData.areasCompared.slice(0, 3).join(' vs ');
      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — COMPARACIÓN DE VECINDARIOS:\nÁreas comparadas: ${areasStr}\n\nCONTEXTO DE COMPARACIÓN:\n- Referencia las áreas específicas que compararon.\n- Pivote a reserva: "Kasandra puede compartir lo que está viendo en el terreno en esas áreas — contexto que no aparece en una herramienta."\n- Siempre incluye chip "Hablar con Kasandra".`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — NEIGHBORHOOD COMPARISON:\nAreas compared: ${areasStr}\n\nNEIGHBORHOOD COMPARE CONTEXT:\n- Reference the specific areas they compared.\n- Booking pivot: "Kasandra can share what she's seeing on the ground in those areas — context that doesn't show up in a tool."\n- Always include "Talk with Kasandra" chip.`;
      }
    }

    // --- Market Intelligence data (live stats from CTA click) ---
    const miData = context.market_intel_data;
    if (miData && miData.daysOnMarket > 0) {
      const implication = miData.daysOnMarket <= 20 ? 'fast-moving' : miData.daysOnMarket <= 45 ? 'balanced' : 'buyer-favorable';
      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — INTELIGENCIA DEL MERCADO:\nDías en mercado: ${miData.daysOnMarket}\nRatio precio/lista: ${miData.saleToListRatio}\nCosto diario de espera: $${miData.holdingCostPerDay}\nDatos en vivo: ${miData.isLive ? 'Sí' : 'Fallback'}\n\nCONTEXTO DE MERCADO:\n- Referencia estas estadísticas específicas. Son ${implication === 'fast-moving' ? 'un mercado activo' : implication === 'balanced' ? 'un mercado equilibrado' : 'un mercado favorable para compradores'}.\n- Pivote a reserva: "Estos son promedios — Kasandra puede decirte qué significan para tu código postal y rango de precio."\n- Siempre incluye chip "Hablar con Kasandra".`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — MARKET INTELLIGENCE:\nDays on market: ${miData.daysOnMarket}\nSale-to-list ratio: ${miData.saleToListRatio}\nDaily holding cost: $${miData.holdingCostPerDay}\nLive data: ${miData.isLive ? 'Yes' : 'Fallback'}\n\nMARKET INTELLIGENCE CONTEXT:\n- Reference these specific stats. It's a ${implication} market.\n- Booking pivot: "These are averages — Kasandra can tell you what they mean for your ZIP and price point."\n- Always include "Talk with Kasandra" chip.`;
      }
    }

    // --- Instant Answer tool output (affordability calculator + home value estimator) ---
    const isInstantAnswer = toolUsed === 'instant_answer'
      || (context.tools_completed ?? []).includes('instant_answer');

    if (isInstantAnswer && context.estimated_budget) {
      const budget = `$${Number(context.estimated_budget).toLocaleString()}`;
      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — CALCULADORA DE ASEQUIBILIDAD:\nPrecio máximo de compra estimado: ${budget}\n\nEl visitante usó la calculadora de asequibilidad y obtuvo un precio máximo de compra de ${budget}. Está en modo comprador. Referencia este número de forma natural cuando sea relevante. Pivote a reserva: "Kasandra puede ayudarte a alinear ese presupuesto con lo que está disponible en el mercado ahora mismo."`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — AFFORDABILITY CALCULATOR:\nEstimated maximum purchase price: ${budget}\n\nThe visitor used the affordability calculator and got a maximum purchase price of ${budget}. They are in buyer mode. Reference this number naturally when relevant. Booking pivot: "Kasandra can help you align that budget with what's available in the market right now."`;
      }
    }

    if (isInstantAnswer && context.estimated_value && context.entry_source === 'instant_answer_value') {
      if (language === 'es') {
        toolOutputHint += `\n\nRESULTADO DE HERRAMIENTA — ESTIMADOR DE VALOR DEL HOGAR:\nEl visitante usó el estimador de valor y obtuvo un rango estimado. Está en modo vendedor. Referencia este contexto cuando sea relevante. Pivote a reserva: "Kasandra puede darte una valoración más precisa basada en las ventas recientes en tu área."`;
      } else {
        toolOutputHint += `\n\nTOOL RESULT — HOME VALUE ESTIMATOR:\nThe visitor used the home value estimator and got an estimated range. They are in seller mode. Reference this context when relevant. Booking pivot: "Kasandra can give you a more precise valuation based on recent sales in your area."`;
      }
    }


    // ============= JOURNEY STATE ENGINE =============
    // Guard 1: Coerce readiness_score to safe number
    const rawReadiness = Number(context.readiness_score);
    const safeReadinessScore = Number.isFinite(rawReadiness) ? rawReadiness : 0;
    const guidesReadCount = typeof context.guides_read === 'number' ? context.guides_read : 0;

    // FIX 4: Server-side phase escalation based on guide depth
    if (guidesReadCount >= 8) {
      effectiveChipPhase = Math.max(effectiveChipPhase, 3) as 1 | 2 | 3;
    } else if (guidesReadCount >= 5) {
      effectiveChipPhase = Math.max(effectiveChipPhase, 2) as 1 | 2 | 3;
    }

    // P5: Readiness score auto-escalate — ≥75 + non-explore intent → Phase 3
    if (safeReadinessScore >= 75 && effectiveIntent !== 'explore') {
      effectiveChipPhase = Math.max(effectiveChipPhase, 3) as 1 | 2 | 3;
      console.log(`[Selena] P5: Auto-escalated to Phase 3 (readiness=${safeReadinessScore}, intent=${effectiveIntent})`);
    }

    // FIX 2: High-intent financial question detection
    const HIGH_INTENT_FINANCIAL = /how much|what.*need|can i afford|what do i need|cuánto.*necesito|cuanto.*necesito|what.*cost|total.*need/i;
    const isHighIntentQuestion = HIGH_INTENT_FINANCIAL.test(message);

    // FIX 3: Inherited home + trust signal detection (scans full conversation + persisted context)
    const allConversation = [...history.map(h => h.content), message].join(' ');
    const isInheritedHome = INHERITED_HOME_PATTERNS.test(allConversation) || context.inherited_home === true;
    const hasTrustSignal = TRUST_SIGNAL_PATTERNS.test(allConversation) || context.trust_signal_detected === true;

    const journey = classifyJourneyState({
      readiness_score: safeReadinessScore,
      tools_completed: toolsCompleted,
      guides_read_count: guidesReadCount,
      intent: effectiveIntent,
      language,
      isInheritedHome,
      timeline: timeline || context.timeline || undefined,
      hasTrustSignal,
      // FIX-SIM-09: pass user turn count so journeyState can advance explore→evaluate after 3+ turns
      user_turn_count: conversationState.userTurns,
    });

    let governanceHint = "";
    if (proceedsOverride || asapTimeline) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA: El usuario quiere saber sus ganancias netas (o tiene urgencia ASAP). Recomiende DIRECTAMENTE la herramienta de estimación de ganancias netas. NO ofrezca guías. Respuesta = 1 reconocimiento + 1 recomendación directa. Las opciones de acción se muestran automáticamente como botones.`
        : `\n\nGOVERNANCE: User is asking about net proceeds (or has ASAP urgency). Recommend the net proceeds estimator DIRECTLY. Do NOT offer guides. Response = 1 acknowledgment + 1 direct recommendation. Action buttons are shown automatically by the system.`;
    } else if (escalated) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA ANTI-LOOP: El usuario ha pedido la misma cosa 2 veces. NO repita la misma respuesta. Diga: "Ya que ha explorado eso, el paso más claro ahora es estimar sus números." Los botones de acción se muestran automáticamente.`
        : `\n\nGOVERNANCE ANTI-LOOP: User has repeated the same request 2 times. Do NOT offer the same response. Say: "Since you've already explored that, the clearest next step is estimating your numbers." Action buttons are shown automatically by the system.`;
    } else if (phase === 2) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA FASE 2: La intención está clara. Sea decisivo — recomiende UN paso concreto. No pregunte "¿preferiría una herramienta o una guía?". Máximo 2 opciones. Los botones se muestran automáticamente.`
        : `\n\nGOVERNANCE PHASE 2: Intent is known. Be decisive — recommend ONE concrete next step. Do NOT ask "would you prefer a tool or a guide?". Max 2 options. Action buttons are shown automatically by the system.`;
    }

    // Append Journey State Engine governance hint to system prompt
    governanceHint += journey.governanceHint;

    // ============= HIGH INTENT OVERRIDE =============
    // If user asked a direct financial question OR has read 5+ guides, force booking pivot
    if (isHighIntentQuestion && guidesReadCount >= 2) {
      governanceHint += language === 'es'
        ? `\n\nINTENTO ALTO — PREGUNTA FINANCIERA DIRECTA:\nEste usuario preguntó algo específico sobre costos/números. Ha leído ${guidesReadCount} guías. NO ofrezca más guías.\nResponda con un dato específico si es posible, luego pivotee: "Kasandra puede darte tu número exacto basado en tu préstamo y plazo. Esa llamada es gratuita y toma 20 minutos."\nPrimera respuesta sugerida: "Hablar con Kasandra".`
        : `\n\nHIGH INTENT — DIRECT FINANCIAL QUESTION:\nUser asked a specific cost/number question. They've read ${guidesReadCount} guides. Do NOT offer more guides.\nAnswer with a specific data point if possible, then pivot: "Kasandra can give you your actual number based on your loan type and timeline. That call is free and takes 20 minutes."\nFirst suggested reply: "Talk with Kasandra".`;
    }

    // ============= INHERITED HOME CONTEXT HINT =============
    if (isInheritedHome) {
      governanceHint += language === 'es'
        ? `\n\nHERENCIA DETECTADA:\nEste vendedor heredó la propiedad. Situación de alta sensibilidad.\n- Reconozca el peso emocional brevemente, sin exagerar\n- Preocupaciones clave: ser aprovechado, entender valor real, decisión correcta para la familia\n- Pivote: "Kasandra ha ayudado a familias a navegar propiedades heredadas — entiende la complejidad."\n- Siempre incluya "Hablar con Kasandra". NO recomiende más guías.`
        : `\n\nINHERITED HOME DETECTED:\nThis seller inherited the property. High-sensitivity situation.\n- Acknowledge the emotional weight once, briefly\n- Key concerns: being taken advantage of, understanding true value, family obligation\n- Pivot: "Kasandra has helped families navigate inherited properties — she understands the complexity."\n- Always include "Talk with Kasandra". Do NOT recommend more guides.`;
    }

    // ============= P4: INVESTOR PATH RESOLUTION =============
    if (effectiveIntent === 'invest') {
      governanceHint += language === 'es'
        ? `\n\nRUTA DE INVERSIONISTA:\nKasandra se especializa en propietarios residenciales. Para inversionistas, redirige directamente:\n"Kasandra trabaja con inversionistas que buscan propiedades residenciales en Tucson — desde propiedades de alquiler hasta oportunidades de remodelación. Una llamada corta le ayudaría a entender exactamente qué está buscando."\nRespuesta sugerida: "Hablar con Kasandra".`
        : `\n\nINVESTOR PATH:\nKasandra specializes in residential homeowners. For investors, redirect directly:\n"Kasandra works with investors looking at residential properties in Tucson — from rental properties to fix-and-flip opportunities. A short call would help her understand exactly what you're looking for."\nSuggested reply: "Talk with Kasandra".`;
    }

    // ============= P12: MILITARY/VA RECOGNITION =============
    const isBAHTool = (context.tools_completed ?? []).includes('bah_calculator') || toolUsed === 'bah_calculator';
    if (isBAHTool) {
      governanceHint += language === 'es'
        ? `\n\nCOMPRADOR MILITAR DETECTADO:\nEste usuario completó la calculadora BAH — probablemente militar activo o veterano (Davis-Monthan AFB).\n- Reconozca su servicio brevemente: "Gracias por su servicio."\n- Referencia VA: "Con elegibilidad VA, usted puede calificar para $0 de enganche y tasas de interés más bajas."\n- Sugiera la guía militar: "Tenemos una guía específica para familias militares mudándose en Tucson."\n- Contexto de reserva: "Kasandra ha ayudado a varias familias militares a establecerse en Tucson — entiende el proceso PCS."\nPrimera respuesta sugerida: guía militar-pcs. Segunda: "Hablar con Kasandra".`
        : `\n\nMILITARY BUYER DETECTED:\nThis user completed the BAH calculator — likely active duty or veteran (Davis-Monthan AFB area).\n- Acknowledge service briefly: "Thank you for your service."\n- VA reference: "With VA eligibility, you may qualify for $0 down and better interest rates."\n- Surface military guide: "We have a guide specifically for military families PCSing to Tucson."\n- Booking context: "Kasandra has helped several military families settle in Tucson — she understands the PCS timeline."\nFirst suggested reply: military-pcs guide. Second: "Talk with Kasandra".`;
    }

    // ============= TRUST SIGNAL HINT =============
    if (hasTrustSignal && (isInheritedHome || isHighIntentQuestion || guidesReadCount >= 5)) {
      governanceHint += language === 'es'
        ? `\n\nSEÑAL DE CONFIANZA DETECTADA:\nEl usuario ha expresado confianza explícita en Kasandra. Valide su instinto e invite a reservar.\n"Su instinto sobre Kasandra es correcto — ha construido su reputación exactamente en este tipo de situaciones. El siguiente paso es una conversación directa con ella."`
        : `\n\nTRUST SIGNAL DETECTED:\nUser has explicitly expressed trust in Kasandra. Validate their instinct and invite booking.\n"Your instinct about Kasandra is right — she's built her reputation on exactly the kind of situations you're describing. The next step is a direct conversation with her."`;
    }

    // ============= GUIDE DELIVERY RULE + REPETITION GUARD =============
    governanceHint += language === 'es'
      ? `\n\nREGLA DE ENTREGA DE GUÍAS:\nCuando un usuario acepta ver una guía ("sí", "claro", "muéstrame", "cuéntame más"), NO describa la guía de nuevo. Responda con una oración + el chip de la guía directamente. Nunca describa el mismo contenido de guía dos veces en turnos consecutivos.\n\nGUARDIA DE REPETICIÓN:\nSi su respuesta repetiría sustancialmente el mismo contenido que su respuesta anterior, reformule completamente. Ofrezca un ángulo diferente o escale al siguiente paso.`
      : `\n\nGUIDE DELIVERY RULE:\nWhen a user agrees to see a guide ("yes", "sure", "show me", "tell me more"), do NOT describe the guide again. Respond with one sentence + the guide chip directly. Never describe the same guide content twice in consecutive turns.\n\nREPETITION GUARD:\nIf your response would repeat substantially the same content as your previous response, reframe entirely. Offer a different angle or escalate to the next step.`;

    // ============= GUIDE INQUIRY ROUTING HINT =============
    const GUIDE_INQUIRY = /what guides|which guide|qu[eé]\s+gu[ií]as|guias|show.*guides|recommend.*guide|gu[ií]as.*tien/i;
    if (GUIDE_INQUIRY.test(message)) {
      governanceHint += language === 'es'
        ? '\n\nRUTA DE GUÍAS: El usuario preguntó sobre guías. Muestre 2-3 chips de guías. NO describa el contenido de las guías. Una oración de introducción solamente.'
        : '\n\nGUIDE ROUTING: User asked about guides. Show 2-3 guide chips. Do NOT describe guide content. One sentence intro only.';
    }

    // ============= STOP TALKING RULE (Phase 3 / Mode 4) =============
    // When action buttons are present (calculator, booking, tools), the AI must
    // end its turn immediately. No follow-up questions. No persuasion.
    if (currentMode === 4 || phase === 3 || proceedsOverride || asapTimeline) {
      governanceHint += language === 'es'
        ? `\n\nREGLA DURA: Botones de acción están adjuntos a esta respuesta. Su texto DEBE ser 1-2 oraciones máximo — un reconocimiento breve y una recomendación directa. NO haga preguntas de seguimiento. NO agregue "¿le gustaría...?" ni "la mayoría encuentra útil...". Termine su turno.`
        : `\n\nHARD RULE: Action buttons are attached to this response. Your text MUST be 1-2 sentences max — one brief acknowledgment and one direct recommendation. Do NOT ask follow-up questions. Do NOT add "would you like to..." or "most people find it helpful...". End your turn.`;
    }
    
    // Add stall recovery hint if needed
    if (stalled) {
      reflectionHint += language === "es"
        ? `\n\nDETECTADO: El usuario parece estancado. Ofrece resumir o preguntar si prefiere seguir explorando.`
        : `\n\nDETECTED: User appears stalled. Offer to summarize or ask if they'd prefer to keep exploring.`;
    }
    
    // Add mode hint
    let guideModeHint = "";
    if (context.entry_source === 'guide' || context.entry_source === 'guide_handoff') {
      const guideTitle = context.last_guide_title || 'a guide';
      guideModeHint = language === 'es'
        ? `\n\nMODO GUÍA: El usuario abrió el chat desde la guía "${guideTitle}". Restringe las sugerencias a: entender la guía, usar herramientas relacionadas, o hacer preguntas. NO sugieras guías o herramientas no relacionadas. NO hagas ventas cruzadas ni introduzcas urgencia.`
        : `\n\nGUIDE MODE: User opened chat from guide "${guideTitle}". Restrict suggestions to: understanding the guide, using related tools, or asking questions. Do NOT suggest unrelated guides or tools. Do NOT cross-sell or introduce urgency.`;
    }

    // ============= ENTRY GREETING HINT (FIX 1) =============
    // On first turn with a recognized entry_source, inject personalized greeting context
    // so the AI adapts its Mode 1 response to how the user arrived.
    let entryGreetingHint = "";
    const ENTRY_SOURCES_WITH_GREETINGS = ['guide_handoff', 'calculator', 'bah_calculator', 'neighborhood_detail', 'floating', 'synthesis', 'quiz_result', 'post_booking'];
    if (
      conversationState.userTurns <= 1 &&
      context.entry_source &&
      ENTRY_SOURCES_WITH_GREETINGS.includes(context.entry_source)
    ) {
      try {
        const entryCtx: EntryContext = {
          source: context.entry_source as EntryContext['source'],
          language,
          calculatorAdvantage: context.calculator_advantage as EntryContext['calculatorAdvantage'],
          calculatorDifference: context.calculator_difference,
          guideId: context.entry_guide_id ?? undefined,
          guideTitle: context.entry_guide_title ?? undefined,
          guidesReadCount: context.guides_read ?? 0,
          intent: primaryIntent,
          closingCostData: context.closing_cost_data ?? undefined,
          sellerCalcData: context.seller_calc_data as EntryContext['sellerCalcData'],
          readinessData: context.readiness_entry_data as EntryContext['readinessData'],
        };
        const greeting = generateEntryGreeting(entryCtx);
        if (greeting?.content) {
          entryGreetingHint = language === 'es'
            ? `\n\nCONTEXTO DE ENTRADA: El usuario llegó desde "${context.entry_source}". Adapte su primera respuesta a este tono: "${greeting.content.substring(0, 200)}..."`
            : `\n\nENTRY CONTEXT: User arrived from "${context.entry_source}". Adapt your first response to this tone: "${greeting.content.substring(0, 200)}..."`;
        }
      } catch {
        // Silent fail — entry greeting is a bonus, not a requirement
      }
    }

    const modeHint = language === "es"
      ? `\n\nMODO ACTUAL: ${currentMode} (${modeContext.modeName}). Ajusta el tono y las sugerencias según este modo.`
      : `\n\nCURRENT MODE: ${currentMode} (${modeContext.modeName}). Adjust tone and suggestions for this mode.`;

    // ============= FIX-SIM-10: PHASE 3 REPETITION NUDGE =============
    // If we're in Phase 3 AND the chip history shows 2+ identical Phase 3 turns,
    // inject a softening nudge so the user knows they can reach Kasandra directly.
    // This prevents silent dead-ends when a user hasn't clicked after multiple Phase 3 turns.
    const phase3ChipHistory = engagement.chipHistory;
    const recentPhase3Turns = phase3ChipHistory.filter(m =>
      /estimate.*proceeds|talk.*kasandra|hablar.*kasandra|estimar.*ganancias/i.test(m)
    ).length;
    const isPhase3RepetitionActive = phase === 3 && recentPhase3Turns >= 2;
    // (nudge injected below after reply is generated, before response)

    // ============= FIRST SELLER TURN INTERCEPT =============
    // If user just declared selling intent on their first turn, short-circuit
    // with a calm prequalification response + timeline bubbles.
    // 
    // GUARD: Do NOT re-fire if the current message IS a timeline response chip.
    // This prevents the intercept from looping when the route always injects 'sell'.
    const TIMELINE_REPLY_PATTERNS = /^(asap|lo antes posible|\d[\d\s\-–]+\s*(month|mes|day|día)|1.?3\s*(month|mes)|3.?6\s*(month|mes)|just exploring|solo explorando|months?|meses?|\d+.?\d+\s*(days?|días?))/i;
    const isTimelineReply = TIMELINE_REPLY_PATTERNS.test(message.trim());
    
    // Timeline re-ask guard: skip first-seller intercept if timeline was recently asked
    const turnCount = context.turn_count ?? 0;
    const timelineRecentlyAsked = context.timeline_last_asked_turn !== undefined && 
      context.timeline_last_asked_turn !== null &&
      (turnCount - context.timeline_last_asked_turn) < 10;
    
    const isFirstSellerTurn = conversationState.userTurns <= 1
      && (primaryIntent === 'sell' || primaryIntent === 'cash')
      && !context.last_tool_completed
      && !context.quiz_completed
      && !isTimelineReply    // Never re-fire on timeline chip responses
      && !proceedsOverride   // PROCEEDS override takes absolute priority over first-turn intercept
      && !asapTimeline       // ASAP override also bypasses first-turn intercept
      && !context.timeline   // Don't re-ask if timeline already known
      && !timelineRecentlyAsked // Don't spam timeline question
      && !guardState.containment_active; // KB-9: Containment always takes priority

    if (isFirstSellerTurn) {
      const sellerFirstReply = language === 'es'
        ? 'Entendido — vender es una decisión importante, y lo vamos a tomar un paso tranquilo a la vez. ¿Con qué tipo de plazo está trabajando?'
        : "Got it — selling is a big decision, and we'll take it one calm step at a time. What kind of timeline are you working with?";

      const sellerTimelineBubbles = language === 'es'
        ? ["Lo antes posible (0–30 días)", "1–3 meses", "3–6 meses", "Solo explorando"]
        : ["ASAP (0–30 days)", "1–3 months", "3–6 months", "Just exploring"];

      return new Response(
        JSON.stringify({
          ok: true,
          reply: sellerFirstReply,
          suggestedReplies: sellerTimelineBubbles,
          actions: [],
          language,
          lead_id: leadId,
          detected_intent: primaryIntent,
          booking_cta_shown: false,
          current_mode: currentMode,
          mode_name: modeContext.modeName,
          chip_phase_floor: Math.max(effectiveChipPhase, 2), // Intent declared → floor at least 2
          timeline_last_asked_turn: turnCount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // FIX 3: Low-signal acknowledgment handler — prevent tool re-summarization on "ok"/"sure"
    const LOW_SIGNAL_PATTERN = /^(ok|okay|sure|got it|alright|ya|yep|yea|yeah|sí|si|vale|entendido|claro|bueno|dale|ándale|orale|mhm|hmm|k)\.?$/i;
    if (LOW_SIGNAL_PATTERN.test(message.trim())) {
      governanceHint += language === 'es'
        ? '\n\nSEÑAL BAJA DETECTADA: El usuario dio una confirmación breve. NO resuma herramientas ni guías anteriores. Haga UNA pregunta que avance: "¿Qué le ayudaría más ahora — ver sus números específicos o hablar con Kasandra sobre su situación?"'
        : '\n\nLOW-SIGNAL DETECTED: User gave a brief acknowledgment. Do NOT re-summarize tools or guides. Ask ONE forward-moving question: "What would help most right now — seeing your specific numbers, or talking through your situation with Kasandra?"';
    }

    const messagesPayload = [
      { role: "system", content: systemPrompt + vipHint + memorySummary + reflectionHint + sellerDecisionHint + marketPulseHint + neighborhoodHint + listingsHint + toolOutputHint + governanceHint + journeyHint + trailHint + guideModeHint + entryGreetingHint + modeHint + guardRules.guardHints + (guardState.containment_active ? (language === 'es' ? '\n\nCONTENCIÓN ACTIVA — OBLIGATORIO: Responda en MÁXIMO 2 oraciones cortas. NO explique quién es. NO ofrezca credenciales. Solo reconozca + ofrezca hablar con Kasandra.' : '\n\nCONTAINMENT ACTIVE — MANDATORY: Respond in MAXIMUM 2 short sentences. Do NOT explain who you are. Do NOT offer credentials. Just acknowledge + offer to talk with Kasandra.') : '') }, 
      ...history.slice(-10), // Extended to -10 to support persistent memory context
      { role: "user", content: message }
    ];

    let response;
    let modelUsed = "google/gemini-3-flash-preview";

    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelUsed,
          messages: messagesPayload,
          max_tokens: guardRules.maxTokensOverride ?? (effectiveChipPhase >= 2 ? 100 : 150),
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Primary model failed: ${response.status}`);
      }
    } catch (e) {
      console.warn("Primary model failed, falling back to openai/gpt-4o-mini", e);
      modelUsed = "openai/gpt-4o-mini";
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelUsed,
          messages: messagesPayload,
          max_tokens: guardRules.maxTokensOverride ?? (effectiveChipPhase >= 2 ? 100 : 150),
          temperature: 0.7,
        }),
      });
    }

    // Log model usage for analytics (uses handler-scoped supabase client)
    if (supabase) {
      try {
        await supabase.from("event_log").insert({
          session_id: context.session_id,
          event_type: "selena_model_usage",
          event_payload: {
            model: modelUsed,
            fallback_triggered: modelUsed !== "google/gemini-3-flash-preview",
            timestamp: new Date().toISOString()
          }
        });
      } catch (e) {
        console.error("Failed to log model usage event:", e);
      }
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "I'm here to help. How can I guide you today?";
    let reply = sanitizeBracketCTAs(rawReply);

    // ============= POST-PROCESSING: BREVITY ENFORCEMENT =============
    // KB-10 mandates 1-3 sentences max. Truncate at 3rd sentence boundary.
    // Preserve the reply if it's already short enough.
    const SENTENCE_BOUNDARY = /(?<=[.?!。])\s+/g;
    const sentences = reply.split(SENTENCE_BOUNDARY).filter(s => s.trim().length > 0);
    if (sentences.length > 3) {
      reply = sentences.slice(0, 3).join(' ');
    }
    // FIX 1: Sentence completeness guard — drop incomplete trailing fragment
    if (reply.length > 0 && !/[.?!。]$/.test(reply.trim())) {
      const completeSentences = reply.match(/[^.?!。]*[.?!。]/g);
      if (completeSentences && completeSentences.length > 0) {
        reply = completeSentences.join(' ').trim();
      } else {
        // Entire reply is one incomplete fragment — append ellipsis
        reply = reply.trim() + '...';
      }
    }

    // FIX 2: Banned phrase post-filter — deterministic safety net
    const BANNED_OPENER = /^(I apologize[—\-,.]?\s*|I'm sorry[—\-,.]?\s*|Me disculpo[—\-,.]?\s*|Lo siento[—\-,.]?\s*)/i;
    if (BANNED_OPENER.test(reply)) {
      reply = reply.replace(BANNED_OPENER, '').trim();
      // If stripping left nothing meaningful, use neutral reframe
      if (reply.length < 10) {
        reply = language === 'es'
          ? 'Continuemos desde donde estábamos.'
          : "Let's pick up where we were.";
      }
      // Capitalize first letter after strip
      if (reply.length > 0) {
        reply = reply.charAt(0).toUpperCase() + reply.slice(1);
      }
    }

    // ============= SERVER-SIDE ONBOARDING HARD BLOCK =============
    // Safety backstop: if intent exists or chip_phase_floor >= 2, the AI must never
    // output literal onboarding prompt variants. Replace with neutral "welcome back".
    const ONBOARDING_BLOCK_PATTERNS = /are you looking to buy.*sell.*explore|just explore what's possible|what brings you here today|what brings you here|qué le trae por aquí|está pensando en comprar.*vender.*explorar|está buscando comprar.*vender.*explorar/i;
    
    if ((context.intent || effectiveChipPhase >= 2) && ONBOARDING_BLOCK_PATTERNS.test(reply)) {
      reply = language === 'es'
        ? 'Bienvenido/a de vuelta — podemos continuar donde lo dejamos.'
        : 'Welcome back — we can pick up where you left off.';
    }

    // Check if booking access is earned (from mode detection)
    const hasEarned = modeContext.allowBookingCTA;

    // ============= CHIP GOVERNANCE: FINAL CHIP SELECTION =============
    // Priority hierarchy:
    // 1. Guard overrides (containment/overwhelm/human_takeover) — handled below via guardRules.chipOverrides
    // 2. Mode 4 HANDOFF chips
    // 3. Stall recovery
    // 4. Proceeds / ASAP override → Phase 3 chips
    // 5. Journey State chips (NEW)
    // 6. Governed phase chips (Phase 1, 2, or 3)
    let suggestedReplies: string[];
    
    // Guard 3: Journey chips only when higher-priority systems are NOT active
    const isMode4Handoff = currentMode === 4;
    const isStallRecovery = stalled;
    const isProceedsOverride = proceedsOverride || asapTimeline;
    const canApplyJourneyChips =
      !guardState.containment_active &&
      guardState.emotional_posture !== 'overwhelmed' &&
      guardState.escalation_level !== 'human_takeover' &&
      !isProceedsOverride &&
      !isStallRecovery &&
      !isMode4Handoff;

    if (isMode4Handoff) {
      // HANDOFF mode: use semantic keys — resolved to localized labels by client
      suggestedReplies = [CHIP_KEYS.FIND_A_TIME, 'i_have_a_question'];
    } else if (isStallRecovery) {
      // Stall recovery — semantic keys for 3 options
      suggestedReplies = ['summarize_where_i_am', 'keep_exploring', 'specific_question'];
    } else if (isProceedsOverride) {
      // PROCEEDS / ASAP override — hard lock to Phase 3 semantic keys
      suggestedReplies = [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA];
    } else if (effectiveIntent === 'invest') {
      // P4: INVESTOR REDIRECT — hard-lock to booking pivot
      suggestedReplies = [CHIP_KEYS.TALK_WITH_KASANDRA, CHIP_KEYS.INTENT_EXPLORE];
    } else if (isBAHTool) {
      // P12: MILITARY RECOGNITION — hard-lock to military guide + booking
      suggestedReplies = [CHIP_KEYS.GUIDE_MILITARY, CHIP_KEYS.TALK_WITH_KASANDRA];
    } else {
      // Layer 5: Keyword-triggered chips (PROGRESSION_MAP) — highest specificity
      const keywordChips = getSuggestedReplies(effectiveIntent, language, message);
      const fallbackChips = getSuggestedReplies(effectiveIntent, language);
      const hasKeywordHit = keywordChips.length > 0 && JSON.stringify(keywordChips) !== JSON.stringify(fallbackChips);
      
      if (hasKeywordHit) {
        // Keyword override — use PROGRESSION_MAP match
        suggestedReplies = keywordChips;
      } else if (canApplyJourneyChips && journey.stageChips.length > 0) {
        // Layer 6: Journey State Engine chips
        suggestedReplies = journey.stageChips;
      } else if (chips.length > 0) {
        // Layer 7: Governed phase chips (fallback)
        suggestedReplies = chips;
      } else {
        // FIX 6: Empty chips guard — never return empty array
        suggestedReplies = effectiveIntent === 'buy'
          ? [CHIP_KEYS.AFFORDABILITY_CALCULATOR, CHIP_KEYS.BROWSE_GUIDES]
          : [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA];
      }

      // ============= CONTEXT-AWARE CHIP INJECTION =============
      // When AI response mentions specific tools, override with relevant tool chips
      const replyLower = reply.toLowerCase();
      const toolMentionChips: string[] = [];
      if (/affordability|buying power|poder de compra|cuánto puedo pagar/.test(replyLower)) toolMentionChips.push(CHIP_KEYS.AFFORDABILITY_CALCULATOR);
      if (/closing cost|costos de cierre/.test(replyLower)) toolMentionChips.push(CHIP_KEYS.ESTIMATE_CLOSING_COSTS);
      if (/net proceeds|ganancias netas|walk away/.test(replyLower)) toolMentionChips.push(CHIP_KEYS.ESTIMATE_PROCEEDS);
      if (/readiness|preparación/.test(replyLower) && effectiveIntent === 'buy') toolMentionChips.push(CHIP_KEYS.BUYER_READINESS);
      if (/readiness|preparación/.test(replyLower) && (effectiveIntent === 'sell' || effectiveIntent === 'cash')) toolMentionChips.push(CHIP_KEYS.SELLER_READINESS);
      if (/neighborhood|vecindario|area|área/.test(replyLower)) toolMentionChips.push(CHIP_KEYS.COMPARE_NEIGHBORHOODS);
      if (/home.*worth|home.*value|cuánto vale|valuation|valuación/.test(replyLower)) toolMentionChips.push(CHIP_KEYS.HOME_VALUATION);
      
      // If we detected tool mentions and current chips don't match, inject them
      if (toolMentionChips.length > 0) {
        const existingSet = new Set(suggestedReplies);
        const newChips = toolMentionChips.filter(c => !existingSet.has(c));
        if (newChips.length > 0) {
          // Prepend tool-specific chips, keep max 3
          suggestedReplies = [...newChips, ...suggestedReplies].slice(0, 3);
        }
      }
    }

    // Guard 4: If journey_state !== 'decide', strip booking-only chips/actions
    // This is a HARD GATE — applies even when proceeds/ASAP override is active
    // Only exception: Mode 4 HANDOFF (human-directed) and guard chip overrides
    if (journey.journey_state !== 'decide' && !isMode4Handoff && !isBAHTool) {
      suggestedReplies = suggestedReplies.filter(s =>
        !BOOKING_KEYWORDS.test(s) && !BOOKING_PHRASES.test(s)
      );
    }

    // Apply earned-access filter (strips booking language if not earned)
    // EXCEPTION: Phase 3 chips always include "Talk with Kasandra" — the escalation IS the earned signal.
    // EXCEPTION: Investor intent always surfaces booking pivot (P4 governance).
    // EXCEPTION: Military BAH users get booking access (P12 governance).
    const isPhase3 = phase === 3 || proceedsOverride || asapTimeline;
    const isInvestorRedirect = effectiveIntent === 'invest';
    const isMilitaryBypass = isBAHTool;
    suggestedReplies = filterSuggestionsForEarnedAccess(suggestedReplies, hasEarned || isPhase3 || isInvestorRedirect || isMilitaryBypass);

    // Apply journey awareness filter: remove chips for already-completed tools (destination-based)
    const journeyFilter = filterChipsForCompletedTools(suggestedReplies, toolsCompleted, language, hasEarned || isPhase3 || isInvestorRedirect || isMilitaryBypass);
    suggestedReplies = journeyFilter.filtered;

    // Telemetry: log suppressions for audit trail
    if (journeyFilter.suppressions.length > 0) {
      console.log('[JourneyAwareness] Suppressed chips:', JSON.stringify(journeyFilter.suppressions));
    }

    // EMAIL-ASKING SUPPRESSION: If Selena is actively collecting email, clear chips
    // so users can't click stale Phase 3 chips instead of typing their address.
    const replyAsksForEmail = /email\s*(address)?.*\?|what.*email|your email|correo\s*(electr[oó]nico)?.*\?/i.test(reply);
    if (replyAsksForEmail && !extractedEmail && currentMode !== 4) {
      suggestedReplies = ['skip_for_now'];
    }

    // ============= GUARD CHIP OVERRIDES =============
    // If the guard produced chip overrides (overwhelm, post-booking, anxiety loop),
    // they take absolute priority over all other chip governance.
    if (guardRules.chipOverrides) {
      suggestedReplies = guardRules.chipOverrides;
    }

    // ============= FIX-SIM-10: PHASE 3 REPETITION — SOFT NUDGE =============
    // If user has been shown Phase 3 chips 2+ times without clicking, add a
    // direct-reach nudge to the reply text so they know there's a live path.
    if (isPhase3RepetitionActive && !guardRules.chipOverrides && !guardState.containment_active) {
      const nudge = language === 'es'
        ? ' Si prefiere hablar directamente, Kasandra está disponible - solo haga clic en "Hablar con Kasandra" o llame al (520) 349-3248.'
        : " If you'd like to connect directly, Kasandra is available - just click \"Talk with Kasandra\" or call (520) 349-3248.";
      if (!reply.includes('349-3248') && !reply.includes('Talk with Kasandra')) {
        reply = reply.trimEnd() + nudge;
      }
    }

    // ============= STRUCTURAL GUIDE DELIVERY ENFORCEMENT =============
    // Deterministic post-processing: if user affirms after assistant mentioned a guide,
    // force direct guide delivery chip and suppress guide re-description.
    const lastUserMessage = message.toLowerCase().trim();
    const lastAssistantMessage = [...history].reverse().find(m => m.role === 'assistant')?.content ?? '';
    const isAffirmativeResponse = GUIDE_DELIVERY_AFFIRMATIVE.test(lastUserMessage);
    const mentionedGuide = GUIDE_MENTION_PATTERN.test(lastAssistantMessage);
    const shouldForceGuideDelivery =
      isAffirmativeResponse &&
      mentionedGuide &&
      !guardRules.chipOverrides &&
      !guardState.containment_active;

    if (shouldForceGuideDelivery) {
      const guideChip = detectGuideChipForDelivery(lastAssistantMessage, context);
      suggestedReplies = [guideChip, ...suggestedReplies.filter(chip => chip !== guideChip)];
      reply = language === 'es' ? 'Aquí está:' : 'Here it is:';
    }

    const actions: Array<{ label: string; href: string; eventType: string }> = [];
    
    // Guard 4 (actions): Only add booking action if earned AND journey_state is 'decide'
    if (hasEarned && journey.journey_state === 'decide') {
      actions.push({
        label: language === "es" ? "Revisar Estrategia con Kasandra" : "Review Strategy with Kasandra",
        href: "/book",
        eventType: "book_click",
      });
    }

    // ============= PERSISTENT MEMORY STORE (fire-and-forget) =============
    try {
      const memoryStoreUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/selena-memory`;
      fetch(memoryStoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          action: "store",
          session_id: context.session_id,
          lead_id: leadId || undefined,
          message,
          assistant_reply: reply,
          context: {
            intent: effectiveIntent,
            timeline: context.timeline,
            estimated_value: context.estimated_value,
            estimated_budget: context.estimated_budget,
          },
        }),
      }).catch((e) => console.error("[Selena] Memory store fire-and-forget failed:", e));
    } catch (e) {
      console.error("[Selena] Memory store setup failed:", e);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reply,
        suggestedReplies,
        actions,
        language,
        lead_id: leadId,
        // Return CANONICAL detected intent only
        detected_intent: primaryIntent !== 'explore' ? primaryIntent : null,
        booking_cta_shown: hasEarned,
        // Mode telemetry
        current_mode: currentMode,
        mode_name: modeContext.modeName,
        // Chip governance telemetry + monotonic floor
        chip_phase: phase,
        chip_phase_floor: effectiveChipPhase,
        chip_escalated: escalated,
        // Guard telemetry
        guard_violations: guardRules.violations,
        guard_emotional_posture: guardState.emotional_posture,
        guard_escalation_level: guardState.escalation_level,
        containment_active: guardState.containment_active,
        vulnerability_signal_count: guardState.vulnerability_signal_count,
        guard_overlay: guardState.containment_active ? "containment" : null,
        // Journey awareness telemetry
        tools_suppressed: journeyFilter.suppressions.length > 0 ? journeyFilter.suppressions : undefined,
        // Journey State Engine telemetry
        journey_state: journey.journey_state,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        reply: "I'm having a moment - please try again.",
        message: "Internal server error",
      }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
