
# Seller Decision Receipt → Selena Continuity — SHIPPED

4 files edited, no new components.

## Changes Applied

| File | Change |
|------|--------|
| `selenaSession.ts` | Widened `ToolUsed` to include `'seller_decision'` |
| `StepReceiptView.tsx` | Import + persist receipt context before `openChat` |
| `SelenaChatContext.tsx` | `!!` boolean coercion on `isAllowedGreetingSource`, added `'seller_decision'` to allowed sources, Priority 1.5 greeting branch with deterministic chips, receipt fields in `sendMessage` payload |
| `selena-chat/index.ts` | Interface fields + `sellerDecisionHint` in English-only system prompt |
