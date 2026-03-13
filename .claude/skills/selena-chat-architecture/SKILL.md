---
name: selena-chat-architecture
description: Deep architectural knowledge of the selena-chat Supabase edge function. Use this when reading, editing, refactoring, or extracting modules from supabase/functions/selena-chat/index.ts or any of its imported modules (modeContext.ts, guardState.ts, journeyState.ts).
---

# selena-chat Edge Function Architecture

## Critical Warning
`supabase/functions/selena-chat/index.ts` is **3,673 lines**. It cannot be safely edited in a single pass. Always read the full file before making any changes. Understand the import chain before touching anything.

## File Inventory
```
supabase/functions/selena-chat/
  index.ts          # 3,673 lines — main handler (MONOLITH)
  modeContext.ts    # 297 lines — mode-specific context injection
  guardState.ts     # 549 lines — KB containment overlay system
  journeyState.ts   # 153 lines — journey state classifier
  entryGreetings.ts # Entry greeting definitions (size unknown — read before editing)

supabase/functions/_shared/
  cors.ts           # Shared CORS headers
  rateLimit.ts      # Shared rate limiting: checkRateLimit, extractRateLimitKey, rateLimitResponse
```

## The 14 Dynamic Context Blocks (assembled at line 3443)
Assembly order (concatenated in this exact sequence):

| # | Variable | Lines | Purpose |
|---|----------|-------|---------|
| 1 | `systemPrompt` | ~2780 | Base bilingual prompt (KB-0 through KB-12), built by `buildSystemPrompt()` |
| 2 | `memorySummary` | 2786-2797 | Concierge memory: name, property value, situation from context audit |
| 3 | `reflectionHint` | 2800-2823 | Modes 2/3: references last guide/tool/guides-read count |
| 4 | `sellerDecisionHint` | 2826-2836 | Seller Decision receipt: situation, priority, condition, recommended path |
| 5 | `marketPulseHint` | 2842-2908 | Tucson market data from `market_pulse_settings` table |
| 6 | `neighborhoodHint` | 2914-2958 | ZIP-based neighborhood intelligence from `neighborhood_profiles` table |
| 7 | `toolOutputHint` | 3108-3271 | Surfaces numbers from completed tools: Seller Net, Readiness scores, Cash quiz, Buyer Closing Costs, Off-Market, Neighborhood Compare, Market Intelligence |
| 8 | `governanceHint` | 3306-3366 | Phase/proceeds/ASAP/anti-loop governance + Journey State Engine hint + trust signal + guide delivery rule + repetition guard + stop-talking rule |
| 9 | `journeyHint` | 3077-3083 | Lists completed tools — instructs AI not to re-suggest them |
| 10 | `trailHint` | 3088-3102 | Session trail breadcrumbs (page/tool/guide visits with timestamps) |
| 11 | `guideModeHint` | 3376-3382 | When entry_source is 'guide' or 'guide_handoff': restricts suggestions to guide context |
| 12 | `modeHint` | 3384-3386 | Current mode number + name injected for tone alignment |
| 13 | `guardRules.guardHints` | from guardState.ts | Guard state violations, emotional posture constraints, identity/timeline lock rules |
| 14 | Containment override | 3443 (inline) | If `containment_active`: hard 2-sentence limit, no credentials, acknowledge + Kasandra only |

## Key Function/Constant Names

| Concern | Name | Location |
|---------|------|----------|
| Email extraction (regex) | `EMAIL_REGEX` | line 242 |
| Email extraction (fn) | `extractEmail(message)` | line 244 |
| Rate limiting | `checkRateLimit`, `extractRateLimitKey`, `rateLimitResponse` | `../_shared/rateLimit.ts` |
| Booking gate | `hasEarnedBookingAccess(context, history, message, extractedEmail)` | line 543 |
| Booking keyword detect | `userAskedToBook(message)` | line 526 |
| Booking suggestion filter | `filterSuggestionsForEarnedAccess(suggestions, hasEarned)` | line 571 |
| Booking keywords | `BOOKING_KEYWORDS` | line 517 |
| Booking phrases | `BOOKING_PHRASES` | line 521 |
| Intent detection | `detectIntent(message, route)` | line 328 |
| Intent priority picker | `pickPrimaryIntent(intents)` | line 195 |
| Timeline detection | `detectTimeline(message)` | line 231 |
| Lead upsert | `upsertLeadProfile(email, context, intent, timeline)` | line 267 |
| Chip governance | `getGovernedChips(intent, timeline, engagement, language)` | line 468 |
| Chip filter (completed tools) | `filterChipsForCompletedTools(chips, toolsCompleted, language, hasEarned)` | line 882 |
| Chip keys registry | `CHIP_KEYS` | lines 588-632 |
| Chip → destination map | `CHIP_KEY_DESTINATION` | lines 635-679 |
| Legacy chip → destination | `CHIP_DESTINATION` | lines 686-782 |

## Guide Chip Intent Categories

**Sell-intent guide IDs** (`SELL_GUIDE_IDS`):
divorce-selling, inherited-probate-property, distressed-preforeclosure, life-change-selling, senior-downsizing, cash-vs-traditional-sale, selling-for-top-dollar, pricing-strategy, cost-to-sell-tucson, how-long-to-sell-tucson, sell-now-or-wait, sell-or-rent-tucson, home-prep-staging, capital-gains-home-sale-arizona, cash-offer-guide, understanding-home-valuation, military-pcs-guide

**Buy-intent guide IDs** (`BUY_GUIDE_IDS`):
first-time-buyer-guide, arizona-first-time-buyer-programs, buying-home-noncitizen-arizona, move-up-buyer, pima-county-property-taxes

**Neutral** (all others — e.g., relocating-to-tucson, tucson-neighborhoods, tucson-suburb-comparison): fall through to `'neutral'`

## modeContext.ts — The 4 Modes

| Mode | Name | Trigger | Key Behavior |
|------|------|---------|--------------|
| 1 | ORIENTATION | Default (no intent, <2 turns, no guides/tools) | Ask ONE gentle question. NEVER mention booking. Reduce anxiety. |
| 2 | CLARITY | Intent declared OR 1+ guide read OR tool used OR 2+ turns | Open with Reflection Sentence. Suggest 2-3 next steps. No booking. |
| 3 | CONFIDENCE | 3+ guides OR tool result OR quiz completed | Reflect on progress. Summarize insights. `reflectionRequired: true`. No hard booking CTA. |
| 4 | HANDOFF | Explicit booking ask OR email provided OR (tool used + 2+ turns) | One sentence calm acknowledgment. No persuasion. No follow-up questions. `allowBookingCTA: true`. |

Also exports: `getModeSuggestedReplies(mode, language, intent)`, `generateReflectionSentence(language, context)`, `MODE_INSTRUCTIONS_EN`, `MODE_INSTRUCTIONS_ES`

## journeyState.ts — 3-State Journey Classifier

States: `explore` → `evaluate` → `decide`

**Important**: journeyState.ts does NOT detect intent. It receives `intent` from `index.ts` (via `detectIntent()` + `pickPrimaryIntent()`).

`DECIDE_INTENTS = ['buy', 'sell', 'cash']`
`DECIDE_TOOLS = ['tucson_alpha_calculator', 'seller_decision']`

Classification priority (highest first):

| Priority | Signal | Result |
|----------|--------|--------|
| 1 | `isInheritedHome && timeline === 'asap'` | `decide` — immediate booking |
| 2 | `isInheritedHome` (any timeline) | `decide` — empathetic pivot |
| 3 | `hasTrustSignal && intent ∈ DECIDE_INTENTS` | `decide` |
| 4 | `guides_read_count >= 5 && intent ∈ DECIDE_INTENTS` | `decide` |
| 5 | `readiness_score >= 60 && tools_completed includes DECIDE_TOOLS && intent ∈ DECIDE_INTENTS` | `decide` |
| 6 | `readiness_score >= 30 OR tools_completed >= 1 OR guides_read_count >= 2` | `evaluate` |
| 7 (default) | Everything else | `explore` |

## Planned Extraction Targets (Refactor Roadmap)

Extract in this order to minimize risk:

1. **`systemPrompt.ts`** — Extract `buildSystemPrompt()` and the ~2,500 line bilingual prompt. Reduces index.ts by ~68%. Highest priority.
2. **`emailExtractor.ts`** — `EMAIL_REGEX` + `extractEmail()`. Self-contained, safe to extract early.
3. **`rateLimiter.ts`** — Already in `_shared/rateLimit.ts`. Verify import path, may already be done.
4. **`bookingGate.ts`** — `BOOKING_KEYWORDS`, `BOOKING_PHRASES`, `userAskedToBook()`, `hasEarnedBookingAccess()`, `filterSuggestionsForEarnedAccess()`.
5. **`chipGovernance.ts`** — `CHIP_KEYS`, `CHIP_KEY_DESTINATION`, `CHIP_DESTINATION`, `getGovernedChips()`, `filterChipsForCompletedTools()`.
6. **`contextAssembler.ts`** — The 14 context block assembly. Depends on modeContext.ts, guardState.ts, journeyState.ts.

After extraction, index.ts should be a thin orchestrator (~300-400 lines).

## Safe Refactor Protocol
1. Read the ENTIRE current file before writing any changes
2. Extract ONE module at a time
3. After each extraction: verify imports compile, test the chat endpoint
4. Never modify guardState.ts hierarchy order
5. Never increase max_tokens beyond 150 without explicit instruction
6. EN and ES system prompt versions must stay in sync — edit both or neither

## Client-Side Selena Context Modules (src/context/selena/)
These are frontend modules — separate from the edge function but part of the same system:

| File | Lines | Purpose |
|------|-------|---------|
| `types.ts` | 136 | Type definitions — EntrySource (39 sources), EntryContext, ChatMessage, ChipMeta |
| `greetingEngine.ts` | 670 | Greeting generation with trail awareness — `computeGreeting()` |
| `chipGovernance.ts` | 249 | Client-side chip filtering — `mapChipsToActionSpecs()`, `getPhaseAwareChips()` |
| `reportManager.ts` | 252 | Report generation/retrieval — `generateReport()`, `openReportById()` |
| `identityManager.ts` | 58 | Chat history persistence — `getStoredHistory()`, `saveHistory()`, `getStoredLeadId()` |

`greetingEngine.ts` at 670 lines is the largest client-side context module. Read it fully before editing.

