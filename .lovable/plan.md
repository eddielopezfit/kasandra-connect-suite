

# Cash Flow Audit: Remove Dead Ends, Consolidate CTAs, Kill Private Cash Review

## Problems Found

### 1. Private Cash Review page is a dead end
The `/private-cash-review` page adds zero unique value. It's just:
- "Chat with Selena" (already available everywhere via floating button)
- Kasandra bio (already on `/about` and multiple pages)
- "Schedule via Selena" (already offered in calculator next steps)

The user clicks "Start My Private Cash Review" expecting deeper analysis — they get a page that says "talk to Selena." That's a broken promise. **Kill the page entirely.**

### 2. "Save My Calculation" is a dead promise
EquityPulseSection promises "monthly Equity Pulse updates" but there is no email delivery system, no cron job, no notification pipeline. It saves to `session_snapshot` which nobody reads. The user gets a toast that says "Selena is now monitoring..." — she isn't. **Remove it.**

### 3. Share button shares a generic URL
It shares the `/cash-offer-options` page URL, not the user's actual results. Low value, adds clutter. **Remove it.**

### 4. Six CTAs after results — decision paralysis
After seeing results, the user faces:
1. Save My Calculation
2. Share
3. See My Next Steps
4. Start My Private Cash Review
5. Ask Selena About My Situation
6. Review Strategy with Kasandra
7. Understanding Home Valuation (guide)

This violates the "One Primary CTA" hierarchy. **Consolidate to 2.**

### 5. Step 3 recommendation copy is borderline advisory
"A Cash Offer Could Work in Your Favor" implies a recommendation. Needs to reflect what the user explored, not advise.

## The Fix

### Remove Private Cash Review page
- Delete route from `App.tsx`
- Delete `src/pages/v2/V2PrivateCashReview.tsx`
- Remove any nav links to it

### Flatten calculator from 4 steps to 3
Kill Step 3 ("Next Steps") entirely. After results (Step 2), show only:
1. **Primary CTA**: "Walk through this with Kasandra" → `/book?intent=cash&source=calculator`
2. **Secondary**: "Have questions? Ask Selena" → opens chat with cash intent

No guide suggestion, no private cash review, no save, no share.

### Remove EquityPulseSection from results
Delete the "Monitor Your Equity Growth" block from Step 2. The results + "Cost of Time" + disclaimer stay. Below that, the two CTAs above replace the "See My Next Steps" button.

### Fix Step 2 recommendation summary
Move the personalized recommendation summary (currently in Step 3) into the bottom of Step 2 results, rewritten as neutral reflection:
- Cash: "Based on your inputs, the cash path showed a speed advantage" (not "could work in your favor")
- Traditional: "Based on your inputs, the traditional path showed a higher net" (not "could maximize your return")  
- Consult: "The numbers are close — a conversation with Kasandra can help you weigh what matters most"

### Files Modified
1. **`src/App.tsx`** — remove `/private-cash-review` route
2. **`src/components/v2/calculator/TucsonAlphaCalculator.tsx`** — flatten to 3 steps (intro → inputs → results+CTA), remove EquityPulseSection import, remove Step 3, add inline CTA pair after results
3. **`src/components/v2/calculator/CalculatorNextSteps.tsx`** — delete file (no longer used)
4. **`src/components/v2/calculator/EquityPulseSection.tsx`** — delete file (dead promise)
5. **`src/components/v2/calculator/index.ts`** — remove deleted exports
6. **`src/pages/v2/V2PrivateCashReview.tsx`** — delete file

**Estimated scope**: 1-2 implementation messages. Deletions + TucsonAlphaCalculator rewrite.

