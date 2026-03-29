

# Full Tool & CTA Audit — Hub-Wide Optimization

## Audit Findings

### Tool-by-Tool CTA Analysis

| Tool Page | Post-Result CTAs | Issue |
|---|---|---|
| **Affordability Calculator** | 1) Selena CTA card, 2) "Talk to Kasandra" booking button, 3) ToolResultLeadCapture (email), 4) ToolResultNextStep | **4 stacked CTAs** — cognitive overload. Same pattern as Net-to-Seller before fix. |
| **BAH Calculator** | 1) Selena CTA card, 2) "Talk to Kasandra" booking button, 3) ToolResultLeadCapture (email), 4) ToolResultNextStep | **4 stacked CTAs** — identical redundancy pattern. |
| **Buyer Closing Costs** | 1) Selena CTA card, 2) "Review This With Kasandra" booking button, 3) ToolResultLeadCapture (email), 4) ToolResultNextStep | **4 stacked CTAs** — same issue. |
| **Net-to-Seller** (already fixed) | 1) "Walk Through This with Kasandra" (primary), 2) "Ask Selena" (secondary), 3) ToolResultNextStep | **Clean.** Only 2 terminal CTAs + journey nudge. Model pattern. |
| **Home Valuation** (Step 4 success) | 1) "Ask Selena About Selling", 2) "Read: Cash Offer vs Traditional" link, 3) ToolResultNextStep | **Acceptable.** 1 action + 1 guide link + journey nudge. No stacking. |
| **Buyer Readiness** | ReadinessSnapshot (1 contextual CTA) + "Browse all guides" link + LeadCaptureModal (auto-fires) + ToolResultNextStep | **Acceptable.** Modal is gated, snapshot is contextual. |
| **Seller Readiness** | Same pattern as Buyer Readiness | **Acceptable.** |
| **Cash Readiness** | Same pattern as Buyer/Seller Readiness | **Acceptable.** |
| **Seller Decision Wizard** | QuizFunnelLayout — isolated, receipt-based | **Clean.** No stacking. |

### Core Problem

Three calculator pages (Affordability, BAH, Buyer Closing Costs) have the **same redundancy pattern**: a sand-colored CTA card with both a Selena button AND a booking button, PLUS a ToolResultLeadCapture email capture, PLUS a ToolResultNextStep card. That's 4 conversion touchpoints stacked vertically after results.

### Selena Memory & Journey Awareness

All three calculators already pass context to Selena via `openChat()` with `source`, `intent`, and tool-specific data (e.g., `estimatedBudget`, `closingCostData`). This data flows into the `selena-chat` edge function's session context, so Selena **does** have memory of the user's tool usage. The `tools_completed` array and `last_tool_completed` field are persisted via `session_snapshots`. This is working correctly.

---

## Fix: Standardize All Calculator Pages to Net-to-Seller Pattern

Remove the redundant "sand CTA card" section from Affordability, BAH, and Buyer Closing Costs. Keep only:
1. **ToolResultLeadCapture** (email capture — non-intrusive, dismissible)
2. **ToolResultNextStep** (journey-aware next action)

The ToolResultLeadCapture already provides the "Kasandra can find homes matching your budget" prompt. The ToolResultNextStep already routes to booking for high-engagement users. The sand CTA card is pure redundancy.

### File Changes

| # | File | Change |
|---|------|--------|
| 1 | `V2AffordabilityCalculator.tsx` | Delete lines 285-314 (sand CTA card with Selena + booking buttons) |
| 2 | `V2BAHCalculator.tsx` | Delete lines 286-314 (sand CTA card with Selena + booking buttons) |
| 3 | `V2BuyerClosingCosts.tsx` | Delete lines 458-496 (sand CTA card with Selena + booking buttons) |

### Post-Fix Flow (all 3 calculators)

```text
Calculator Results
  ↓
ToolResultLeadCapture (email — appears after 2s delay, dismissible)
  ↓
ToolResultNextStep (journey-aware: routes to guides, neighborhoods, or booking based on depth)
  ↓
Footer
```

Clean. Consistent with Net-to-Seller. No cognitive overload. Each element serves a distinct purpose.

### What We're NOT Changing

- **Readiness quizzes** — their pattern is already correct (modal-gated capture + snapshot CTA)
- **Home Valuation** — success state has 1 action + 1 guide link, no stacking
- **Seller Decision** — isolated funnel, receipt-based, clean
- **Net-to-Seller** — already fixed in previous pass
- **Selena memory** — already working. Session context, tools_completed, and openChat source params all flow correctly

### Unused Import Cleanup

After removing the CTA sections, clean up unused imports in each file:
- `V2AffordabilityCalculator.tsx`: Remove `Calendar` from lucide imports, `Link` from react-router-dom
- `V2BAHCalculator.tsx`: Remove `Calendar` from lucide imports, `Link` from react-router-dom
- `V2BuyerClosingCosts.tsx`: Remove `Calendar` from lucide imports

