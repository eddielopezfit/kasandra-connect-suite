# Architecture: selena-chat Edge Function

## Critical Facts

- **`supabase/functions/selena-chat/index.ts` is ~1,391 lines** — reduced from 4,182 via modular extraction
- Contains: main serve handler only + imports from 6 domain modules
- **Domain Modules** (extracted March 2026):
  - `types.ts` — shared interfaces (ChatMessage, ChatRequest, CanonicalIntent)
  - `intentDetection.ts` — intent/timeline classification
  - `leadCapture.ts` — email extraction, lead upsert, analytics logging
  - `bookingLogic.ts` — earned-access gates, stall detection, bracket CTA sanitizer, edge cache
  - `chipGovernance.ts` — chip governance, session state, progression maps, suggested replies
  - `systemPromptBuilder.ts` — full EN/ES system prompts, dynamic prompt assembly
- **Pre-existing modules** (unchanged):
  - `modeContext.ts` (297 lines) — 4-mode architecture (welcome, guide, tool, concierge)
  - `guardState.ts` (549 lines) — containment + drift prevention governance
  - `journeyState.ts` (153 lines) — TOFU/MOFU/BOFU classifier
  - `entryGreetings.ts` — server-side greeting variants

## Model Configuration

- **Primary model**: `google/gemini-3-flash-preview`
- **Fallback**: `openai/gpt-4o-mini`
- **`max_tokens`**: 100 for Phase 2+ (brevity enforcement), 150 for Phase 1 orientation; overrideable by guard rules
- **Post-processing**: Server-side sentence truncation at 3rd sentence boundary (KB-10 enforcement)

## Refactor Notes

- The handler still contains inline constants (GUIDE_CHIP_MAP, SELL_GUIDE_IDS, etc.) that are handler-scoped
- chipGovernanceServer.ts was renamed to chipGovernance.ts for consistency
- BOOKING_KEYWORDS, BOOKING_PHRASES, PROCEEDS_PATTERNS are exported for handler use
