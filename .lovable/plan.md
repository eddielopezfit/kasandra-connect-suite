

# Instant Answer Widget Audit — Critical Integrity Issues

## What I Found

### Issue 1: "What's My Home Worth?" Tab Is Broken (Critical)
The widget calls the `neighborhood-profile` edge function and tries to read `profile.market_snapshot.median_home_price`. But the Perplexity Sonar profile schema **does not contain median_home_price**. The schema returns: `lifestyle_feel`, `buyer_fit`, `seller_context`, `market_framing`, `not_ideal_for`, `fun_fact`. No price data whatsoever.

Result: **every ZIP code returns "ZIP code not found"** — exactly what the screenshots show. The tool is a broken promise on the homepage.

Even if it did return a median price, the "estimate" math is crude — it multiplies the median by bedroom/bathroom/sqft adjustment factors (5% per bedroom, 3% per bathroom) that have no grounding in actual data. This is not Firecrawl or Perplexity-sourced. It's made-up coefficients pretending to be a home valuation tool.

### Issue 2: Affordability Tab Uses Hardcoded Numbers
The algorithm uses:
- `BASE_INTEREST_RATE = 0.0625` (hardcoded, not from market pulse)
- `PROPERTY_TAX_RATE = 0.011` (hardcoded)
- `ANNUAL_INSURANCE = 1200` (hardcoded)

The `scrape-market-pulse` pipeline already fetches live mortgage rates from Redfin/Zillow and stores them in `market_pulse_settings` — but this widget doesn't use them. The affordability calculator on the dedicated `/affordability` page may use them, but this homepage widget doesn't.

The math itself (DTI front-end 28%, back-end 36%, PMI at 0.5%) is standard and correct. But it's selling "Instant Answers" with stale numbers.

### Issue 3: "Talk to Selena About Options" Is a Dead Handoff
When the user clicks "Talk to Selena About Options →", it calls:
```
openChat({ source: 'instant_answer_affordability' })
```
It writes `estimated_budget` to session context, but:
- Selena has **no specific instruction** for `instant_answer_affordability` or `instant_answer_value` sources
- She doesn't know the user just calculated their buying power
- She can't "talk about options" because her prompt has no guidance on what "options" means in this context
- The user gets dropped into a generic greeting

### Issue 4: Not Connected to Journey Progress
Using this widget doesn't register as a completed tool in `useJourneyProgress`. It writes to session context but doesn't advance the user's journey depth. The JourneyRail doesn't reflect it.

## Recommendation: Kill the Home Value Tab, Fix Affordability, Wire to Hub

### What to do with "What's My Home Worth?"
**Remove it.** The dedicated `/home-valuation` page and the Net-to-Seller calculator are the proper tools for this. Putting a broken version on the homepage undermines trust. A Blue Ocean hub doesn't show broken tools — it shows tools that deliver.

### What to do with "What Can I Afford?"
Keep it as a **single-purpose Affordability Quick Check** on the homepage, but:
1. Pull live rates from `useMarketPulse()` instead of hardcoded 6.25%
2. After results show, the CTA should route to the full `/affordability` calculator (which has the detailed breakdown) or to `/buy` — NOT to Selena with no context
3. Register completion in session context so the JourneyRail reflects it

### What to do with the CTA
Replace "Talk to Selena About Options →" with an intent-specific next step:
- If buyer intent detected: "See Full Breakdown →" linking to `/affordability`
- If seller intent: "Estimate Your Net Proceeds →" linking to `/net-to-seller`
- Fallback: "Explore Your Options →" linking to `/buy` or `/sell`

This keeps users on the hub, in the journey, moving toward Kasandra.

## Implementation

### Files Modified
1. **`src/components/v2/calculator/InstantAnswerWidget.tsx`** — Remove tab system entirely. Single affordability calculator. Replace CTA with journey-aware next-step link. Connect to `useMarketPulse` for live rate.
2. **`src/pages/v2/V2Home.tsx`** — Update section header copy from "Instant Answers, Zero Pressure" to something that matches single-tool purpose (e.g., "Check Your Buying Power")

### Files Unchanged
- `affordabilityAlgorithm.ts` — the math is sound, just needs live rate input
- `neighborhood-profile/index.ts` — correct for its actual purpose (neighborhood intelligence), just shouldn't be used for home valuation

**Estimated scope**: 1 implementation message.

