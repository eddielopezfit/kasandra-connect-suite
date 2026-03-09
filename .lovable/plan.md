

# Selena Closing Costs Context Awareness + Booking Pivot

## Problem
"Ask Selena About My Costs" opens Selena with a generic greeting. User just calculated $13K–$18K on a $400K FHA loan — Selena has zero awareness of those numbers. Trust-destroying disconnect. No booking pivot.

## Changes (5 files)

### 1. EntryContext type — add calculator fields
**File:** `src/contexts/selena/types.ts`

Add optional `closingCostData` to `EntryContext`:
```ts
closingCostData?: {
  purchasePrice: number;
  loanType: string;
  downPaymentPercent: number;
  estimatedLow: number;
  estimatedHigh: number;
  totalCashNeeded: number;
};
```

### 2. V2BuyerClosingCosts — pass calculator state
**File:** `src/pages/v2/V2BuyerClosingCosts.tsx`

Update the `openChat` call to include computed values:
```ts
openChat({
  source: 'buyer_closing_costs',
  intent: 'buy',
  closingCostData: {
    purchasePrice: price,
    loanType: inputs.loanType,
    downPaymentPercent: downPct,
    estimatedLow: totLow,
    estimatedHigh: totHigh,
    totalCashNeeded: cashNeeded,
  }
})
```
Only pass `closingCostData` when `calculated` is true (user ran the estimate).

### 3. Client greeting engine — context-aware greeting
**File:** `src/contexts/selena/greetingEngine.ts`

Add a new `else if` block for `buyer_closing_costs` (before the generic fallback, after `neighborhood_detail`):

- **With calculator data:** Reference exact numbers. "You're looking at $X–$Y in closing costs on a $Z [loanType] purchase — plus $D down, that's ~$T total at closing. Some of these are negotiable. Want me to walk you through what Kasandra typically helps reduce?"
- **Without data:** "You're looking into closing costs — smart to do before making an offer. What loan type or price range are you working with?"

Suggested replies with data: "What's negotiable?" / "How do I reduce these?" / "Talk with Kasandra"
Without data: "I'm using FHA" / "Help me estimate" / "Talk with Kasandra"

### 4. SelenaChatContext — pass closing cost data to edge function
**File:** `src/contexts/SelenaChatContext.tsx`

In `openChat`, persist `closingCostData` to session context. In `sendMessage`, include `closing_cost_data` in the context payload sent to the edge function.

### 5. Edge function — KB instruction for closing costs context
**File:** `supabase/functions/selena-chat/index.ts`

Add to the system prompt assembly (KB addendum):

```
CLOSING COSTS CONTEXT:
When entry_source is 'buyer_closing_costs' and closing_cost_data is present:
- Reference the user's specific numbers. They have real data.
- Identify what's negotiable (title fees, lender origination, seller credits).
- Booking pivot: "Kasandra has negotiated these costs down on recent Tucson transactions. A 20-minute call could save you thousands."
- Always include "Talk with Kasandra" chip.
- NEVER give generic buyer education — they have the breakdown.
```

Also update `generateBuyerClosingCostsGreeting` in `entryGreetings.ts` to accept and use `closing_cost_data` from context if present.

### 6. Edge function entry greeting — numbers-aware version
**File:** `supabase/functions/selena-chat/entryGreetings.ts`

Update `generateBuyerClosingCostsGreeting` to accept context with closing cost data and produce a number-specific greeting with booking pivot.

## Result
User calculates → sees numbers → clicks CTA → Selena opens referencing their exact $13K–$18K estimate → explains what's negotiable → pivots to "Kasandra can help reduce these" → booking. Clean conversion path.

