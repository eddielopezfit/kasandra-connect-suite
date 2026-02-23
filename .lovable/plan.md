
# Selena Guide Governance + Destination Mapping (Corrected)

All 5 blocking issues from the strategic review have been resolved in this plan. No `download_pdf`. No implementation-leaking types. Unified naming. Standardized source. Semantic validation only.

---

## Phase 1: ActionSpec Model (Semantic-Only Types)

### New file: `src/lib/actions/actionSpec.ts` (~70 lines)

The type system is purely semantic. Resolution logic (navigate, openChat, window.open) is hidden inside the resolver -- never exposed to the registry or UI.

```text
ActionSpec =
  | { type: "open_guide"; guideId: string; label: { en: string; es: string } }
  | { type: "open_tool"; toolId: string; label: { en: string; es: string } }
  | { type: "run_calculator"; calculatorId: string; label: { en: string; es: string } }
  | { type: "open_chat"; payload: { source: string; guideId?: string; lifeEvent?: string; calculatorId?: string }; label: { en: string; es: string } }
  | { type: "book"; label: { en: string; es: string } }
  | { type: "call_contact"; phone: string; label: { en: string; es: string } }
  | { type: "external_link"; url: string; label: { en: string; es: string } }
```

Resolution map (internal to `resolveAction()`, never surfaced):

| ActionSpec.type | Resolver behavior |
|---|---|
| open_guide | `navigate("/v2/guides/" + guideId)` |
| open_tool | `navigate(TOOL_ROUTES[toolId])` -- e.g., buyer-readiness -> /v2/buyer-readiness |
| run_calculator | `navigate(CALC_ROUTES[calculatorId])` -- e.g., cash-comparison -> /v2/cash-offer-options |
| open_chat | `openChat(payload)` |
| book | `openChat({ source: "earned_access" })` or priority call modal |
| call_contact | `window.open("tel:" + phone)` |
| external_link | `window.open(url, "_blank")` |

Validation (`isActionValid(spec)`) is semantic, not navigational:

| ActionSpec.type | Validation rule |
|---|---|
| open_guide | guideId exists in GUIDE_REGISTRY |
| open_tool | toolId exists in KNOWN_TOOLS constant |
| run_calculator | calculatorId exists in KNOWN_CALCULATORS constant |
| open_chat | payload.source is a valid EntrySource |
| book | always valid |
| call_contact | phone matches `/^\+?[\d\s()-]{7,}$/` |
| external_link | url starts with https:// |

No path validation. No route-table coupling.

---

## Phase 2: Guide Registry Extension

### File: `src/lib/guides/guideRegistry.ts`

Add types:

```text
GuideDestinations = {
  primaryAction: ActionSpec
  secondaryActions: ActionSpec[]   // max 2, enforced by dev warning
  relatedGuideIds: string[]        // max 4, enforced by dev warning
}
```

Add `destinations` field to `GuideRegistryEntry`. Add `getGuideDestinations(guideId)` helper.

Destination map for all entries:

| Guide | Primary | Secondary 1 | Secondary 2 | Related Guides |
|---|---|---|---|---|
| first-time-buyer-guide | open_tool: buyer-readiness | open_chat (buying) | -- | selling-for-top-dollar, cash-offer-guide, first-time-buyer-story |
| selling-for-top-dollar | run_calculator: cash-comparison | open_chat (selling) | -- | cash-offer-guide, understanding-home-valuation, seller-stressful-market-story |
| cash-offer-guide | run_calculator: cash-comparison | open_chat (cash) | -- | selling-for-top-dollar, understanding-home-valuation |
| inherited-probate-property | open_chat (probate clarity) | run_calculator: cash-comparison | -- | cash-offer-guide, selling-for-top-dollar |
| understanding-home-valuation | run_calculator: cash-comparison | open_chat (valuation) | -- | selling-for-top-dollar, cash-offer-guide |

Tier 3 stories -- explicitly locked:

```text
destinations: {
  primaryAction: { type: "open_chat", payload: { source: "guide", guideId, lifeEvent }, label: ... },
  secondaryActions: [],    // explicitly empty
  relatedGuideIds: [],     // explicitly empty
}
```

Label governance (approved calm copy only):

- "Check my readiness" / "Verificar mi preparacion" (buyer tools)
- "Compare my options" / "Comparar mis opciones" (calculator)
- "See selling paths" / "Ver opciones de venta" (selling)
- "What does this mean for me?" / "Que significa esto para mi?" (open_chat)

---

## Phase 3: Guide Mode in Selena

### 3A. Frontend: `src/contexts/SelenaChatContext.tsx`

**Source standardization**: When openChat is called from a guide page, entry context uses `source: "guide"` (not `guide_handoff`). The existing `guide_handoff` source remains in the `EntrySource` type for backward compatibility but the guide_handoff greeting block (lines 560-592) will trigger on `source === "guide"` as well.

Add to the context payload sent to the edge function:
```text
guide_mode: true
guide_allowed_actions: [primaryAction.type, ...secondaryActions.map(a => a.type)]
```

**Replace guide greeting chips** (lines 576-580):

Remove: `"Verify my situation with Kasandra"` (governance violation)

Replace with destination-backed chip derived from the guide's registry:
- Buying guides (first-time-buyer): `{ label: "Check my readiness", actionSpec: { type: "open_tool", toolId: "buyer-readiness" } }`
- Selling/cash/valuation guides: `{ label: "Compare my options", actionSpec: { type: "run_calculator", calculatorId: "cash-comparison" } }`
- Probate/life-event guides: `"What does this mean for me?"` (plain text, stays in chat)

**Fix Spanish Usted** (line 574):
- "estas leyendo" -> "esta leyendo"
- "Quieres" -> "Quiere"
- "tienes" -> "tiene"

**Fix clearHistory greeting** (line 1150):
- "ayudarte a explorar tus opciones" -> "ayudarle a explorar sus opciones"
- "Estas pensando" -> "Esta pensando"

### 3B. Edge function: `supabase/functions/selena-chat/index.ts`

When `context.guide_mode === true`, inject governance hint into system prompt:
```text
GUIDE MODE: User opened chat from guide "{guideTitle}".
Restrict suggestions to: understanding the guide, using related tools, or asking questions.
Do NOT suggest unrelated guides or tools.
Do NOT cross-sell or introduce urgency.
```

**Earned Access Gate fix** (lines 486-489): Remove the turn-count condition entirely:
```text
// REMOVE lines 486-489:
// const hasIntent = context.intent && context.intent !== 'explore';
// if (userTurnCount(history) >= 2 && hasIntent) return true;
```

**Booking phrases safety net** (line 447): Add `verify.*kasandra|verificar.*kasandra` to the BOOKING_PHRASES regex.

---

## Phase 4: Chip Rendering with ActionSpec

### File: `src/components/selena/drawer/SelenaDrawerSuggestedRepliesChips.tsx`

Extend the reply type:

```text
SuggestedReply = string | { label: string; actionSpec: ActionSpec }
```

Rendering logic:
- If `string` -> current behavior (sends as chat message)
- If `{ label, actionSpec }` -> calls `resolveAction(actionSpec, navigate, openChat)` on click
- If `isActionValid(actionSpec)` returns false -> chip does NOT render (no-action-no-render rule)

### File: `src/contexts/SelenaChatContext.tsx` -- ChatMessage type (line 71)

Update type:
```text
suggestedReplies?: (string | { label: string; actionSpec: ActionSpec })[];
```

---

## Phase 5: Concierge Tab Panel Updates

### File: `src/components/selena/ConciergeTabPanels.tsx`

**Guides Panel** (lines 201-205): Replace hardcoded array with registry-driven data:
```text
const featuredGuides = getLiveGuides().filter(g => g.tier <= 2);
```
Each card click resolves via `resolveAction(guide.destinations.primaryAction)`.

**Talk Panel** (lines 408-427): Consolidate duplicate `onPriorityCall` buttons into single CTA: "Connect with Kasandra" / "Conectarse con Kasandra".

**Spanish Usted fixes**:
- Line 148: "tu punto" -> "su punto"
- Line 151: "te trae" -> "le trae"
- Line 305: "Tus Opciones" -> "Sus Opciones"
- Line 331: "estas" -> "esta"; "tu casa" -> "su casa"
- Line 336: "tu casa" -> "su casa"
- Line 341: "tus opciones" -> "sus opciones"
- Line 403: "estas lista" -> "esta listo/a"

---

## Phase 6: Performance Fix

### File: `src/components/selena/SelenaChatDrawer.tsx` (lines 198-241)

Remove inline component wrappers (`MessagesArea`, `SuggestedRepliesChips`, `BottomSection`). Replace with direct JSX usage of `SelenaDrawerMessagesArea`, `SelenaDrawerSuggestedRepliesChips`, and `SelenaDrawerBottomSection` in the render tree. This prevents subtree unmount/remount on every parent re-render.

---

## Files Changed Summary

| File | Type | Changes |
|---|---|---|
| `src/lib/actions/actionSpec.ts` | NEW | Semantic ActionSpec types, resolveAction(), isActionValid() |
| `src/lib/guides/guideRegistry.ts` | EDIT | GuideDestinations type, destinations field on all entries, getGuideDestinations() |
| `src/contexts/SelenaChatContext.tsx` | EDIT | Guide mode context, structured chips, source standardization, Usted fixes |
| `src/components/selena/drawer/SelenaDrawerSuggestedRepliesChips.tsx` | EDIT | Support structured ActionSpec chips, no-action-no-render guard |
| `src/components/selena/ConciergeTabPanels.tsx` | EDIT | Registry-driven guides, consolidated Talk CTA, Usted fixes |
| `src/components/selena/SelenaChatDrawer.tsx` | EDIT | Remove inline component wrappers |
| `supabase/functions/selena-chat/index.ts` | EDIT | Remove turn-count gate, guide_mode governance hint, verify regex |

## What Does NOT Change

- No new guides, no guide content changes
- No database schema changes
- No PDFs (download_pdf type does not exist)
- No placeholder UI
- No urgency language
- Tier 3 stories remain text-only with explicitly empty destinations
- Uncontrolled input pattern in SelenaDrawerBottomSection untouched
