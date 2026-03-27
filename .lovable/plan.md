

# Selena AI Deep Audit — System Prompt, KB, Memory, Chips, and Drawer UI

## Verdict: 95% Optimized — 5% Drift

The architecture is production-grade. No RAG or MCP needed. The issues are behavioral drift and minor UI friction.

---

## What's Working (No Changes Needed)

**Knowledge Base**: KB-0 through KB-12 hierarchy is intact, correctly layered, and enforced by `guardState.ts` (549 lines). No gaps.

**Memory**: Three-tier memory system is fully operational:
1. Persistent memory via `selena-memory` edge function (store + recall)
2. Context audit on session start (parallel fetch from `session_snapshots`, `lead_profiles`, `decision_receipts`)
3. Session trail (chronological breadcrumb of pages/tools visited)

**Tool awareness**: Selena has full awareness of completed tools via `tools_completed` array and `toolOutputHint` blocks. She receives exact calculator results (property value, net difference, advantage path), readiness scores, quiz paths, closing cost breakdowns, off-market criteria, neighborhood comparisons, and market intelligence data. She references these with "your numbers show..." not "the calculator says..."

**Journey awareness**: `filterChipsForCompletedTools()` suppresses chips for already-completed tools. `journeyHint` explicitly tells the AI "User has completed: [list]. Do NOT suggest these tools again."

**Chip governance**: 7-layer priority hierarchy is enforced (Guard > Mode 4 > Stall > Proceeds/ASAP > Keywords > Journey > Phase). Sub-chips for booking (15-min clarity call, Virtual walkthrough, No-pressure review) are present. Expansion chips for "Get my selling options" provide sub-intent narrowing.

**No RAG needed**: The system prompt + 13 dynamic context blocks already inject all necessary knowledge at runtime. The prompts are intent-pruned (seller KB stripped for buyers, buyer KB stripped for sellers), keeping token usage efficient. Adding RAG would increase latency without benefit — the knowledge is finite and fully covered.

**No MCP needed**: All external integrations (GHL, Google Places, YouTube, Firecrawl, Perplexity) are already handled by edge functions. MCP adds no value here.

---

## Issues Found

### CRITICAL — Response Length Violation (Visible in Screenshots)

The screenshots show Selena generating 4-6 sentence responses (100-150 words) despite **three separate** system prompt rules mandating 1-3 sentences:
- KB-10: "Maximum 1-3 sentences before showing chips"
- Core Behavior: "Keep responses to 2-3 sentences"
- Hard Rule (Phase 3): "Your text MUST be 1-2 sentences max"

**Root cause**: `max_tokens: 150` is too generous for 1-3 sentence compliance. At ~1.3 tokens/word, 150 tokens allows ~115 words — enough for 6+ sentences. The model fills the budget.

**Fix**: Reduce `max_tokens` to **100** for Phase 2+ responses (keep 150 for Phase 1 orientation). Add a post-processing sentence counter that truncates at the 3rd period/question-mark and appends the chip array.

### HIGH — System Prompt Redundancy (~400 wasted tokens)

The system prompt contains **duplicate governance blocks**:
- Lines 100-169: "Conversational Operating Doctrine" (tone, flow, booking rules)
- Lines 172-220: Nearly identical content repeated ("CORE BEHAVIOR RULES", "ROLE POSITIONING", "LANGUAGE RULE", "CONCIERGE PHILOSOPHY")

This wastes ~400 tokens per request and creates ambiguity about which block governs. The model may weight the later block more, undermining the earlier, more detailed one.

**Fix**: Merge the duplicate blocks into a single authoritative section. Remove lines 172-220 and consolidate any unique rules into the existing Doctrine block.

### MEDIUM — "How to connect:" Label on Sub-chips

Screenshots show sub-chips (15-min clarity call, Virtual walkthrough, No-pressure review) preceded by a "How to connect:" label. This is a good pattern but the label appears even when the primary chip above is not a booking chip. It should only render when the expanded chip is booking-related.

**Fix**: Gate the "How to connect:" label on the chip being a booking-type action.

### MEDIUM — Desktop "Back to" Link Placement

In the desktop Sheet, the "Back to [page]" link renders inside the header `div` alongside the title controls, creating a cramped layout. On mobile it's correctly placed as a separate sub-bar.

**Fix**: Move the desktop `sourcePage` render outside the header `div` to match mobile placement.

### LOW — Onboarding Overlay Uses Emojis

The first-open onboarding overlay uses emoji bullets (sparkles, chart, calendar) which conflicts with the "no emojis" governance rule in KB-0. Minor brand consistency issue.

**Fix**: Replace emoji bullets with Lucide icons matching the rest of the UI (Compass, Calculator, Calendar).

---

## Implementation Summary

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | Response length drift — add dynamic max_tokens + post-processing truncation | Critical | 15 min |
| 2 | System prompt deduplication (~400 tokens saved) | High | 10 min |
| 3 | Sub-chip "How to connect" label gating | Medium | 5 min |
| 4 | Desktop "Back to" link placement | Medium | 5 min |
| 5 | Onboarding emoji replacement | Low | 5 min |

**Total**: 2 implementation messages.

**No RAG, no MCP, no new infrastructure needed.** The system is architecturally complete. These are calibration fixes to enforce existing governance rules the model is drifting from.

