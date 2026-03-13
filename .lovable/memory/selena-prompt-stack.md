# Architecture: Selena Prompt Stack

## Assembly

System prompt assembled dynamically in `selena-chat/index.ts` (3,673 lines total).

### Static Base
- `SYSTEM_PROMPT_EN` / `SYSTEM_PROMPT_ES` (~2,500 lines combined)
- Contains: KB-0, KB-1, KB-4, KB-6, KB-7, KB-7.1, KB-8, KB-12

### 13 Dynamic Context Blocks (appended at runtime)
memorySummary, reflectionHint, sellerDecisionHint, marketPulseHint, neighborhoodHint, toolOutputHint, governanceHint, journeyHint, trailHint, guideModeHint, modeHint, guardHints, containment override

## Model Configuration

- **Primary**: `google/gemini-3-flash-preview` (NOT Gemini Flash 1.5)
- **Fallback**: `openai/gpt-4o-mini`
- **`max_tokens`**: 150 default, guard rules can override

## Frontend Behavior

- Slices to 6 turns (`slice(-6)`) before sending — reduces network overhead on mobile

## Supporting Modules

- `modeContext.ts` (297 lines) — 4-mode architecture
- `guardState.ts` (549 lines) — containment + drift prevention
- `journeyState.ts` (153 lines) — TOFU/MOFU/BOFU classifier
- `entryGreetings.ts` — server-side greeting variants

## Response Shape

Returns: reply, suggestedReplies, actions, chipMeta, guard_overlay, journey_state, detected_intent, current_mode, chip_phase_floor
