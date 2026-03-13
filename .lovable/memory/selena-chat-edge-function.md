# Architecture: selena-chat Edge Function

## Critical Facts

- **`supabase/functions/selena-chat/index.ts` is 3,673 lines** — the largest file in the codebase
- Contains: full bilingual system prompt (~2,500 lines EN+ES), inline chip governance, earned-access booking gate logic, intent detection, email extraction, rate limiting, and the AI gateway call with fallback
- Imports 3 local modules:
  - `modeContext.ts` (297 lines) — 4-mode architecture (welcome, guide, tool, concierge)
  - `guardState.ts` (549 lines) — containment + drift prevention governance
  - `journeyState.ts` (153 lines) — TOFU/MOFU/BOFU classifier
- Also imports `entryGreetings.ts` for server-side greeting variants

## Model Configuration

- **Primary model**: `google/gemini-3-flash-preview`
- **Fallback**: `openai/gpt-4o-mini`
- **`max_tokens`**: 150 default, overrideable by guard rules

## Refactor Constraint

> **This file cannot be safely edited in a single Lovable prompt.**
> Any changes must be scoped to a specific section with exact line ranges.
> Full refactor requires external tooling (Claude Code or similar).
