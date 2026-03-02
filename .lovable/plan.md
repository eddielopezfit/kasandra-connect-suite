

## Plan: Chip Governance Enhancements (3 Features)

### Feature 1: Confidence-Based Chip Visual Weighting

**What:** Booking chips ("Talk with Kasandra", "Find a time with Kasandra") get a distinct visual treatment based on lead temperature. Warm leads (Phase 3, earned access) see a subtle gold border. Hot leads (ASAP timeline, containment active, or Mode 4 HANDOFF) see a gold-filled chip with stronger contrast.

**How:**
- The edge function already returns `chip_phase`, `containment_active`, `current_mode`, and `booking_cta_shown` in its response payload. These are stored on messages as metadata.
- In `SelenaChatContext.tsx`, extend the `ChatMessage` type to persist `chipMeta: { phase, mode, containment }` from the edge function response onto the message that carries `suggestedReplies`.
- In `SelenaDrawerSuggestedRepliesChips.tsx`, accept `chipMeta` and apply conditional styling:
  - **Hot** (mode 4, containment, or ASAP phase 3): `bg-cc-gold text-cc-navy font-semibold border-cc-gold` 
  - **Warm** (phase 3, non-ASAP): `border-cc-gold/60 bg-cc-sand` (current default + gold border)
  - **Default** (phase 1-2): unchanged
- Only booking-mapped chips (those matching `book` ActionSpec type) get the visual upgrade. Non-booking chips stay default.

**Files changed:** `SelenaChatContext.tsx` (message type + meta persistence), `SelenaDrawerSuggestedRepliesChips.tsx` (visual logic).

---

### Feature 2: Chip Click Analytics Events

**What:** Log a `selena_chip_clicked` event with structured metadata whenever a chip is clicked, covering both plain-text chips (handled by `handleSuggestedReplyClick`) and ActionSpec chips (handled by `resolveAction` in the chips component).

**Payload:**
```
{
  chip_label: string,
  chip_type: 'text' | 'action_spec',
  action_type?: ActionSpec['type'],  // 'book', 'navigate', 'run_calculator', etc.
  phase: number,
  intent: string,
  containment_active: boolean,
  is_booking_chip: boolean
}
```

**How:**
- Add `selena_chip_clicked` to the `EventType` union in `logEvent.ts`.
- In `SelenaDrawerSuggestedRepliesChips.tsx`, enrich `handleClick` to call `logEvent('selena_chip_clicked', {...})` before dispatching the action. The `chipMeta` from Feature 1 provides phase/mode/containment. For ActionSpec chips, extract `type` from the spec.
- The existing `suggested_reply_click` event in `SelenaChatDrawer.tsx` stays as-is for backward compatibility (it only fires for text chips that go through `sendMessage`).

**Files changed:** `logEvent.ts` (new event type), `SelenaDrawerSuggestedRepliesChips.tsx` (log call).

---

### Feature 3: Last-Chance Recovery Chip Pattern

**What:** If a user was shown booking chips (Phase 3 or Mode 4) but navigated away without clicking them, the next time they open Selena, inject a recovery nudge as a greeting with booking chips.

**How:**
- In `SelenaChatContext.tsx`, track a `booking_chips_shown_at` timestamp in `SessionContext` (localStorage). Set it when the response includes `booking_cta_shown: true` or `chip_phase >= 3` with booking chips present.
- Clear `booking_chips_shown_at` when a booking chip IS clicked (already tracked via the new analytics event).
- In the `openChat` greeting logic, add a new priority check (after post-booking, before calculator): if `booking_chips_shown_at` exists AND is < 24h old AND was NOT cleared → inject a recovery greeting:
  - EN: "You were close to connecting with Kasandra. Would you like to continue?"
  - ES: "Estaba cerca de conectarse con Kasandra. ¿Le gustaría continuar?"
  - Chips: `["Talk with Kasandra", "Keep exploring"]` / `["Hablar con Kasandra", "Seguir explorando"]`
- This only fires once per session boundary (use a `recovery_shown` flag to prevent loops).

**Files changed:** `SelenaChatContext.tsx` (recovery detection + greeting), `selenaSession.ts` (new SessionContext fields: `booking_chips_shown_at`, `recovery_shown`).

---

### Implementation Order
1. Feature 2 (analytics) — smallest, no visual changes, foundational for measuring Features 1 & 3
2. Feature 1 (chip weighting) — visual layer, depends on meta propagation
3. Feature 3 (recovery pattern) — greeting logic, depends on analytics signal

