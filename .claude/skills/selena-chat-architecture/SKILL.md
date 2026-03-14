# Selena Chat Architecture
**Last Updated:** March 2026 (full sprint session)

---

## Core Files
- `supabase/functions/selena-chat/index.ts` — 3,673 lines. The entire Selena brain. Monolith. Never let Lovable touch this file.
- `src/contexts/SelenaChatContext.tsx` — React context, ~700 lines. Manages chat state, session, greeting logic.
- `src/contexts/selena/greetingEngine.ts` — ~670 lines. All greeting injection logic.
- `src/contexts/selena/chipGovernance.ts` — Chip label resolution. Line 89 now uses label_es/label_en based on language.
- `src/contexts/selena/types.ts` — EntrySource union type. Add new sources here.
- `src/lib/registry/chipsRegistry.ts` — 82+ entries (41+ semantic keys × EN+ES). All chips registered here.
- `src/lib/analytics/selenaSession.ts` — SessionContext interface, updateSessionContext, setFieldIfEmpty.

---

## KB (Knowledge Base) Hierarchy
KB-0 > KB-1 > KB-2 > ... > KB-9
KB-0 is SUPREME and non-overrideable. Never modify KB-0.
All new knowledge blocks must be subordinate to KB-0.

---

## Corner Connect Positioning KB (commit cb12305)
Location: EN line ~1245 (after platform context, before GEOGRAPHIC AWARENESS)
         ES line ~1975 (equivalent position)

Key directives:
- Cash offer = Kasandra's personally vetted Corner Connect buyer network
- NOT a random iBuyer or algorithm-based offer
- Kasandra controls and reviews BOTH sides
- Approved: "Corner Connect isn't an iBuyer service — it's Kasandra's direct buyer network built over years in Tucson"
- NEVER use "iBuyer" to describe Corner Connect
- NEVER frame as selling to a stranger

---

## Selena Voice Calibration (commit 7393212)
Applied to both SYSTEM_PROMPT_EN and SYSTEM_PROMPT_ES:
- Identity: "I'm Selena — Kasandra's digital concierge and your first step toward her. She calls herself your best friend in real estate..."
- Emoji exception: 🏡 on first intent declared, 🎉 on booking confirmed ONLY
- Spanglish mirroring: "cafecito", "amig@", "vamos juntos" when visitor mixes languages
- Booking language: "hold your hand through the whole process from there."
- Post-booking: "Congratulations! 🎉 Kasandra is going to love meeting you."
- NEW: Celebration & Milestone Moments block
- NEW: Kasandra Signature Phrases block

---

## Instant Answer Widget Context (commit f566305 + 70b23d7)
When tool_used === 'instant_answer':
- estimated_budget in context → Selena references max purchase price naturally
- estimated_value + entry_source === 'instant_answer_value' → seller mode context
- Both EN and ES toolOutputHint blocks at line ~3384
- estimated_budget field added to context interface at line ~117

---

## Session & Greeting Engine (all fixes verified 8/8, March 2026)

### Fork Card Greeting (commits 1bba443, 0f6816b, eae6222, various)
- buyer_fork + seller_fork → shouldInjectGreeting = true (early override, line ~137)
- Dedicated fork greeting block before 'hero' block in greetingEngine.ts
- Fork sources clear localStorage synchronously in openChat (isForkSource flag)
- Dead forkIntentOverride code removed from else block
- V2Home.tsx: updateSessionContext({ intent }) + clearHistory() + openChat() sequence

### Spanish Chip Auto-Detection (commits eae6222, 28793aa, 3f263ec, ff0ebc8)
- Edge function: Spanish auto-detected from user message via regex
  (quiero, necesito, busco, comprar, vender, etc.) at line ~2765
- chipGovernance.ts line 89: normalized text fallback uses label_es/label_en
- SelenaChatContext.tsx: chipLanguage = data.language || languageRef.current
- SelenaChatDrawer.tsx: only shows chips from MOST RECENT assistant message (no stale chip resurrection)
- chipsRegistry.ts: 4 timeline chips added (ASAP, 1-3 months, 3-6 months, Just exploring)
  Label-only chips (no actionSpec — sent as conversational text on click)

### Booking Funnel (all routes confirmed passing)
- Seller readiness → /book?intent=sell&source=readiness ✅
- Cash readiness → /book?intent=cash&source=readiness ✅
- Calculator "Review Strategy" → /book?intent=cash&source=calculator ✅
- Closing Cost Estimator → /book?intent=buy&source=closing_costs ✅
- ZIP Explorer → /book?intent=buy&source=zip_explorer ✅
- Neighborhood Compare → /book?intent=buy&source=neighborhood_compare ✅

---

## EntrySource Union (src/contexts/selena/types.ts)
All valid sources include:
buyer_fork | seller_fork | guide_fab | guide_handoff | calculator | synthesis |
quiz_result | seller_decision | market_intelligence | neighborhood_compare |
neighborhood_detail | neighborhoods_index | buyer_readiness_capture |
seller_readiness_capture | cash_readiness_capture | off_market_registered |
off_market_capture | seller_timeline | hero | floating | proactive |
proactive_homepage | homepage_selena_section | contact_page | selena_ai_page |
sell_comparison_traditional | sell_comparison_undecided |
instant_answer_affordability | instant_answer_value |
buyer_closing_costs | neighborhood_compare_result | market_intelligence_result

---

## toolOutputHint Blocks (supabase/functions/selena-chat/index.ts)
Active blocks (in order, lines ~3170–3405):
1. seller_calc (seller net calculator)
2. cash_readiness (cash quiz)
3. buyer/seller readiness checks
4. closing costs estimator
5. off_market registration
6. neighborhood comparison
7. market intelligence
8. instant_answer (NEW — affordability + home value)

All blocks follow pattern:
if (toolUsed === 'X' || context.tools_completed.includes('X')) {
  if (language === 'es') { toolOutputHint += ES block }
  else { toolOutputHint += EN block }
}

---

## ToolUsed Type (src/lib/analytics/selenaSession.ts)
'tucson_alpha_calculator' | 'buyer_readiness' | 'seller_readiness' |
'cash_readiness' | 'report' | 'seller_decision' | 'instant_answer'

## SessionContext Key Fields
- intent: 'buy' | 'sell' | 'cash' | 'explore'
- tool_used: ToolUsed
- estimated_value: number (from seller calculator or home value estimator)
- estimated_budget: number (from affordability calculator — NEW)
- turn_count: number
- chip_phase_floor: number
- journey_state: 'explore' | 'evaluate' | 'decide'
- language: 'en' | 'es'

---

## Verification Status (March 2026 — all passing)
| Test | Status |
|------|--------|
| Seller fork fresh session → "Hello, I'm Selena..." + 3 neutral chips | ✅ |
| Existing buyer session → seller fork → fresh greeting, history cleared | ✅ |
| Type "Quiero comprar" → Spanish response + Spanish chips | ✅ |
| Toggle to Spanish manually → chips correct | ✅ |
| Buyer chips → no bracket text | ✅ |
| /buy + /sell → no white flash on load | ✅ |
| Seller readiness quiz → routes to /book | ✅ |
| Cash readiness quiz → routes to /book | ✅ |

---

## What NOT to Touch
- KB-0 (ever)
- max_tokens: 150 (intentional — do not increase)
- LOVABLE_API_KEY env var name (not GEMINI_API_KEY)
- selena-chat/index.ts via Lovable (too large, will be corrupted)
