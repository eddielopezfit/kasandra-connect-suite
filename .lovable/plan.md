

## Instant Answer Machine Widget

### Overview
Six files created/modified. A dual-tab homepage widget providing instant affordability and home value estimates, bridging to Selena chat with enriched session context.

### Files

**FILE 1: `src/lib/calculator/affordabilityAlgorithm.ts`** (new)
Pure function with Tucson defaults. Standard amortization reverse-solve for maxPrice from the lower of the two DTI limits (28% front-end, 36% back-end minus debts).

**FILE 2: `src/components/v2/calculator/InstantAnswerWidget.tsx`** (new, ~220 lines)
- Tabs component with gold active underline
- Tab 1 (Affordability): 3 inputs, live `useMemo` results, gold CTA → `openChat({ source: 'instant_answer_affordability' })`
- Tab 2 (Home Value): 4 inputs, "Estimate" button triggers `supabase.functions.invoke('neighborhood-profile')`, heuristic multipliers (±5%/bed, ±3%/bath, ±0.5%/100sqft), range display with Skeleton loading, error state, compliance disclaimer always visible, gold CTA → `openChat({ source: 'instant_answer_value' })`
- Both tabs call `updateSessionContext` before opening chat

**FILE 3: `src/components/v2/calculator/index.ts`** (edit line 10)
Add: `export { default as InstantAnswerWidget } from './InstantAnswerWidget';`

**FILE 4: `src/contexts/selena/types.ts`** (edit line 48)
Add `| 'instant_answer_affordability' | 'instant_answer_value'` to EntrySource

**FILE 5: `src/lib/analytics/selenaSession.ts`** (edit line 10 + add field ~line 70)
- Add `| 'instant_answer'` to ToolUsed type
- Add `estimated_budget?: number` to SessionContext interface

**FILE 6: `src/pages/v2/V2Home.tsx`** (edit ~line 506)
Insert between Services section and Selena AI section:
```tsx
{/* Instant Answer Machine */}
<section className="py-16 lg:py-20 bg-cc-ivory">
  <div className="container mx-auto px-4">
    <div className="text-center mb-10">
      <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
        {t("Run the Numbers", "Haz los Números")}
      </span>
    </div>
    <InstantAnswerWidget />
  </div>
</section>
```

### Key Design Decisions
- Tab 1 results are **live** (useMemo recalculates on every keystroke)
- Tab 2 only fetches **on button click** to avoid unnecessary API calls
- Currency formatting via `Intl.NumberFormat('en-US', { style: 'currency' })`
- Down payment as `<select>` with 3%, 5%, 10%, 20% options
- ZIP validation: must be 5 digits before enabling Estimate button
- Loading state uses Skeleton component during fetch
- Error state: "ZIP code not found" / "Código postal no encontrado"

