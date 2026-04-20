# Architecture: Selena Prompt Stack

## Assembly

System prompt assembled dynamically in `selena-chat/index.ts`.

### Static Base
- `SYSTEM_PROMPT_EN` / `SYSTEM_PROMPT_ES` (~2,500 lines combined)
- Contains: KB-0, KB-1, KB-4, KB-6, KB-7, KB-7.1, KB-8, KB-12

### 16 Dynamic Context Blocks (appended at runtime, in order)
Concatenated onto the system message at index.ts line ~1459:

1. **vipHint** — Visitor Intelligence Profile summary (intent, journey depth, friction signals, tools/guides completed)
2. **memorySummary** — Cross-session memory recall from `conversation_memory` table
3. **reflectionHint** — Mid-session reflection nudge (when turn count crosses thresholds)
4. **sellerDecisionHint** — Seller Decision Wizard receipt context
5. **marketPulseHint** — Live market_pulse data (DOM, sale-to-list, holding cost)
6. **neighborhoodHint** — Last viewed neighborhood profile
7. **listingsHint** — Featured listing context (when on /listings or referenced)
8. **toolOutputHint** — Specific tool result numbers (calculator $, readiness score, closing costs)
9. **governanceHint** — Chip governance state, phase floor, earned-access status
10. **journeyHint** — TOFU/MOFU/BOFU journey state + tools completed list
11. **trailHint** — Session breadcrumb + cross-session GUIDES COMPLETED titles (with synthesis directive)
12. **guideModeHint** — Active guide context when user is on a guide detail page
13. **entryGreetingHint** — First-turn entry greeting context (route + UTM)
14. **modeHint** — Current mode (Welcome/Guide/Tool/Concierge) instructions
15. **guardRules.guardHints** — Containment + drift prevention overlay
16. **containment override** — Mandatory 2-sentence cap when `containment_active`

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
- `chipGovernance.ts` — `filterChipsForCompletedTools` canonical chokepoint at line ~1699

## Response Shape

Returns: reply, suggestedReplies, actions, chipMeta, guard_overlay, journey_state, detected_intent, current_mode, chip_phase_floor
