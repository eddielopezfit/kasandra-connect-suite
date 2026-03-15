

# Implementation Plan: Cleanup, Connection, and Consolidation Pass

## 1. Changes to Make Now

### 1A. Register 3 New Tools in ActionSpec (`src/lib/actions/actionSpec.ts`)

**NAVIGATE_WHITELIST** — add 3 paths:
```
'/affordability-calculator', '/bah-calculator', '/home-valuation'
```

No changes needed to `KNOWN_TOOLS` or `KNOWN_CALCULATORS` — these tools use the `navigate` ActionSpec type (they are pages, not quiz-style tools like buyer-readiness).

### 1B. Register 6 New Chips in `chipKeys.ts`

Add to CHIP_KEYS:
```
AFFORDABILITY_CALCULATOR: 'affordability_calculator'
BAH_CALCULATOR: 'bah_calculator'
HOME_VALUATION: 'home_valuation'
```

Add to CHIP_KEY_TO_DESTINATION:
```
affordability_calculator → '/affordability-calculator'
bah_calculator → '/bah-calculator'
home_valuation → '/home-valuation'
```

### 1C. Register 6 Chip Entries in `chipsRegistry.ts`

Add EN+ES pairs for:
- "Check my buying power" / "Verificar poder de compra" → `/affordability-calculator`
- "BAH buying power" / "Poder de compra BAH" → `/bah-calculator`
- "Get my market analysis" / "Obtener mi análisis" → `/home-valuation`

### 1D. Update Legacy Home-Worth Chips

Currently, "What's my home worth?" and "How much is my home worth?" route to `/seller-decision`. Update these to route to `/home-valuation` instead — that is now the correct semantic destination for valuation intent.

### 1E. Add Tool Cards to Hub Pages

**`V2Buy.tsx`** — expand the 2-column "Buyer Planning Tools" strip to include:
- "Check Buying Power" → `/affordability-calculator`
- "BAH Calculator" → `/bah-calculator` (with military icon)

Change from `grid-cols-2` to `grid-cols-2 sm:grid-cols-4` to accommodate 4 tools cleanly.

**`V2Sell.tsx`** — expand the 3-column "Seller Planning Tools" strip to include:
- "Home Valuation" → `/home-valuation`

Change from `grid-cols-3` to `grid-cols-2 sm:grid-cols-4` for 4 tools.

---

## 2. Things to Merge, Redirect, or Suppress

### 2A. `/private-cash-review` — KEEP, clarify positioning

**Finding:** This page serves a distinct purpose. It is a **gated re-engagement surface** for returning leads who already have a report or have been phone-verified. It uses `PhoneVerificationGate`, `noindex: true`, and references `getLastReportId()`. It is linked from `CalculatorNextSteps.tsx` (post-calculator CTA). This is NOT a duplicate of `/cash-offer-options` — it is the downstream conversion chamber for leads who have already used the calculator.

**Action:** No merge or redirect needed. Add a brief code comment at the top of `V2PrivateCashReview.tsx` clarifying its role as a gated post-calculator conversion surface.

### 2B. Divorce Guides — KEEP BOTH, establish hierarchy

**Finding after deep read:**
- `divorce-selling` (134 lines) — Tier 1 pillar. Emotional + practical. 5-section guide with detailed FAQ (5 questions). Category: "Divorce & Life Transition". Kasandra's personal voice is strong.
- `divorce-home-sale-arizona` (92 lines) — Tier 2 supporting. Legal/factual. 3-path decision framework + FAQ (3 questions). Category: "Hardship & Life Change". More SEO-oriented (AZ community property law).

These are complementary, not duplicative. The pillar guide is emotionally led; the supporting guide is legally led. Both have unique content sections.

**Action:**
- Keep both. Do NOT merge.
- Ensure `divorce-home-sale-arizona` registry entry lists `divorce-selling` as its first `relatedGuideIds` (already true).
- Ensure `divorce-selling` registry entry lists `divorce-home-sale-arizona` in its `relatedGuideIds` (verify and add if missing).
- No redirect needed — different SEO keyword targets.

### 2C. FTB Programs Guides — KEEP BOTH, cross-link

- `arizona-first-time-buyer-programs` — state-level scope
- `first-time-buyer-programs-pima-county` — county-level scope

These target different geographic keyword clusters. **Keep both.** Verify mutual cross-linking in `relatedGuideIds`.

---

## 3. Deterministic Routing Updates Required

| System | File | Change |
|---|---|---|
| NAVIGATE_WHITELIST | `actionSpec.ts` | Add 3 paths |
| CHIP_KEYS | `chipKeys.ts` | Add 3 keys + destinations |
| CHIPS_REGISTRY | `chipsRegistry.ts` | Add 6 entries (EN+ES × 3) |
| Legacy home-worth chips | `chipsRegistry.ts` | Re-route 4 entries from `/seller-decision` to `/home-valuation` |

No changes needed to `selena-chat/index.ts` — the topic hints already exist in `modeContext.ts` and will naturally suggest the chip labels that now resolve correctly.

---

## 4. Hub Page Linking Updates Required

| Hub Page | File | Tools to Add |
|---|---|---|
| `/buy` | `V2Buy.tsx` | Affordability Calculator, BAH Calculator |
| `/sell` | `V2Sell.tsx` | Home Valuation CMA |

Both use the existing "Planning Tools" strip pattern — just expanding the grid.

---

## 5. Guide Consolidation Decisions

| Guide Pair | Decision | Reason |
|---|---|---|
| `divorce-selling` + `divorce-home-sale-arizona` | **Keep both** | Complementary (emotional vs legal), different SEO targets, different categories |
| `arizona-first-time-buyer-programs` + `first-time-buyer-programs-pima-county` | **Keep both** | State vs county scope, different keyword clusters |

Action: Verify bidirectional `relatedGuideIds` cross-linking for both pairs.

---

## 6. Investor-Intent Decision

**Finding:** `investor` exists as a valid intent in `selenaSession.ts` and is referenced in `journeyState.ts` (server-side) where it maps to generic chips (`BROWSE_GUIDES`, `GET_SELLING_OPTIONS`). No dedicated guide, tool, quiz, or content path serves this intent.

**Decision: Suppress — do not remove, but de-emphasize.**

- Keep `investor` in the `Intent` type (removing it would break session data).
- In `journeyState.ts`, change the investor chip set to match the `explore` fallback (it already essentially does this with `BROWSE_GUIDES`). No code change needed — current behavior is safe.
- Do NOT add investor to any public-facing fork cards, Selena greeting chips, or navigation.
- Add a code comment in `selenaSession.ts` noting: "investor intent is passively supported but has no dedicated content path. Do not surface in UI until guides/tools exist."

No code changes required — just a documentation comment.

---

## 7. Governance Checklist Draft

Create `docs/publish-gate-checklist.md`:

```markdown
# Publish Gate Checklist — Kasandra Concierge Hub

Every new page, tool, guide, or Selena flow must pass ALL checks before publish.

## Page / Route
- [ ] Clear, singular purpose (no overlap with existing page)
- [ ] useDocumentHead with unique title + description (EN + ES)
- [ ] SEO meta registered in seoRouteMeta.ts
- [ ] Linked from at least one hub page or contextual surface
- [ ] Clear primary CTA with real destination
- [ ] Analytics: page_view fires on mount
- [ ] Selena floating button present (unless ad funnel)
- [ ] Bilingual: all user-facing text uses t() or equivalent

## Tool / Calculator
- [ ] Route added to NAVIGATE_WHITELIST in actionSpec.ts
- [ ] Chip registered in chipKeys.ts + chipsRegistry.ts (EN + ES)
- [ ] tool_started and tool_completed analytics fire
- [ ] source=website and tool_origin stamped on lead capture
- [ ] Result screen has clear next step (Selena, book, or guide)
- [ ] Linked from relevant hub page (/buy or /sell)

## Guide
- [ ] Registered in guideRegistry.ts with correct tier, category, status
- [ ] Content file in src/data/guides/ with full EN + ES
- [ ] Destinations (primaryAction + secondaryActions) use valid ActionSpecs
- [ ] relatedGuideIds cross-linked bidirectionally
- [ ] GuideToolBridge section connects to at least one tool
- [ ] No overlap with existing guide (check registry)
- [ ] lastVerifiedDate set (when freshness field exists)

## Selena Flow
- [ ] Chips resolve to registered ActionSpecs (no conversational-only chips in Phase 2+)
- [ ] Topic hints added to modeContext.ts if keyword detection needed
- [ ] No changes to selena-chat/index.ts unless strictly required
- [ ] Bilingual chip labels ≤28 chars (Spanish)

## General
- [ ] No duplicate of existing asset
- [ ] TypeScript builds clean
- [ ] Mobile-responsive (test at 390px width)
```

---

## 8. Freshness Governance Plan

**Lightest-weight approach:**

1. Add optional `lastVerifiedDate?: string` field to the `GuideRegistryEntry` interface in `guideRegistry.ts`. Format: `'YYYY-MM-DD'`.

2. Set `lastVerifiedDate` on market-sensitive guides now:
   - `tucson-market-update-2026`
   - `sell-now-or-wait`
   - `how-long-to-sell-tucson`
   - `pricing-strategy`
   - `fha-loan-pima-county-2026`
   - `down-payment-assistance-tucson`

3. In the existing dev-only QA panel (`/qa-cta`), add a small "Stale Guides" section that lists any guide where `lastVerifiedDate` is older than 90 days or missing on a market-sensitive guide. This is dev-only — never shown to visitors.

4. Do NOT surface "last updated" to visitors. It creates trust risk if dates are old. Only use internally for maintenance.

---

## 9. What Should Remain Untouched

- `selena-chat/index.ts` — no edits (topic hints already wired from `modeContext.ts`)
- `guardState.ts` — no edits
- `journeyState.ts` — no edits (investor fallback is already safe)
- Paid funnel routes (`/ad/*`) — no edits
- `V2Layout`, `V2Navigation`, `V2Footer` — no edits
- Session context schema — no edits
- Guide content files — no edits (except verifying `relatedGuideIds`)
- `SelenaChatContext.tsx` — no edits
- `chipGovernance.ts` — no edits (it reads from registries, which we are updating)

---

## Implementation Order

| Phase | Task | Files | Risk |
|---|---|---|---|
| 1 | Add NAVIGATE_WHITELIST paths | `actionSpec.ts` | Low |
| 2 | Add CHIP_KEYS + destinations | `chipKeys.ts` | Low |
| 3 | Add chip registry entries + update legacy home-worth chips | `chipsRegistry.ts` | Low |
| 4 | Add tool cards to `/buy` page | `V2Buy.tsx` | Low |
| 5 | Add tool card to `/sell` page | `V2Sell.tsx` | Low |
| 6 | Add investor suppression comment | `selenaSession.ts` | Trivial |
| 7 | Add `/private-cash-review` role comment | `V2PrivateCashReview.tsx` | Trivial |
| 8 | Verify guide cross-links | `guideRegistry.ts` | Low |
| 9 | Add `lastVerifiedDate` field + set on 6 guides | `guideRegistry.ts` | Low |
| 10 | Create governance checklist | `docs/publish-gate-checklist.md` | None |

**Total: ~10 file edits, 1 new file. No new pages. No new tools. No database changes.**

