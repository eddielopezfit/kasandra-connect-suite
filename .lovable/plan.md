

# QA Test Report — Fix Plan (7 Issues)

Based on the Perplexity QA audit of kasandraprietorealtor.com (scored 8.2/10), here are the 7 identified issues and the plan to resolve them.

---

## CRITICAL Issues

### 1. Selena greeting stays English when site is in Spanish mode
**Root cause**: The `computeGreeting()` function in `greetingEngine.ts` uses the `t()` helper correctly (all greetings have EN/ES pairs), but the *server-side* entry greetings in `entryGreetings.ts` are only used when `selena-chat` edge function generates the first response — NOT on drawer open. The frontend greeting engine (`greetingEngine.ts`) generates the initial greeting and it *does* receive `language` and `t()`. 

After tracing the code: `openChat()` → `computeGreeting(..., t, language)` — the `t()` function and `language` are passed correctly. The default greeting (line 671 of greetingEngine.ts) outputs Spanish correctly via `t()`. 

**Likely cause**: The `hasStoredChatHistory` check returns `true` from a previous English session, so the greeting is *not re-injected* when the user toggles to Spanish. The stored history contains the old English greeting.

**Fix**:
- In `SelenaChatContext.tsx`: detect when the current language differs from the language of the last stored greeting message. If the language changed, clear the stored greeting and re-compute in the new language.
- Add a `language` field to the greeting `ChatMessage` metadata so we can detect language mismatch.
- When language changes while chat is closed and messages exist, replace the initial greeting with a fresh one in the new language.

**Files**: `src/contexts/SelenaChatContext.tsx`, `src/contexts/selena/greetingEngine.ts`

### 2. No standalone Net-to-Seller calculator route
**Root cause**: The net-to-seller calculator (`TucsonAlphaCalculator`) exists but lives only at `/cash-offer-options`. There's no `/net-to-seller` route.

**Fix**:
- Create `src/pages/v2/V2NetToSeller.tsx` — a standalone page using the existing `TucsonAlphaCalculator` component with seller-focused framing (title: "Net-to-Seller Calculator"), CTAs to `/home-valuation` and Selena chat.
- Add route `/net-to-seller` to `App.tsx`.
- Add to sitemap and SEO meta registry.

**Files**: New `src/pages/v2/V2NetToSeller.tsx`, `src/App.tsx`, `public/sitemap.xml`, `src/lib/seo/seoRouteMeta.ts`

### 3. Contact page missing email address
**Root cause**: The contact page (`V2Contact.tsx`) already has a contact form and phone/office info, but no email address is displayed.

**Fix**: 
- Add an email row (with `Mail` icon) showing `kasandra@kasandraoasis.com` as a clickable `mailto:` link, placed between the Phone and Office sections.

**Files**: `src/pages/v2/V2Contact.tsx`

---

## MEDIUM Issues

### 4. Chip navigation exits chat drawer
**Root cause**: In `SelenaDrawerSuggestedRepliesChips.tsx`, the `resolveAction` function (line 139) calls `navigate()` which changes the route. The drawer closes because the route change triggers page unmount/remount behavior.

**Fix**:
- In the `resolveAction` handler within the chips component, when navigating to a tool page, use React Router's `navigate()` but do NOT close the drawer. The drawer's open state is managed by `SelenaChatContext` — it only closes when `closeChat()` is called explicitly. The issue is likely that `resolveAction` calls something that triggers a close. 
- Review `resolveAction` in `actionSpec.ts` to ensure it doesn't call drawer close.
- If the action navigates to a page, keep `isOpen = true` in the chat context.

**Files**: `src/lib/actions/actionSpec.ts`, `src/components/selena/drawer/SelenaDrawerSuggestedRepliesChips.tsx`

### 5. No buyer chips after buy intent message
**Root cause**: The server-side chip governance (`chipGovernance.ts` line 171-182) *does* define buyer chips for Phase 2 buy intent. The `getSuggestedReplies()` function (line 753) also has buy-intent statics. The issue is likely in the *first response* — when intent is freshly detected from "I'm looking to buy," the `context.intent` may not yet be set to `buy` because intent detection happens in the same turn but the chip selection reads the *incoming* context (which still says `explore` or undefined).

**Fix**:
- In `index.ts`, after `detectIntent()` runs and updates `canonicalIntent`, ensure the local intent variable used for chip selection reflects the *newly detected* intent, not just the incoming `context.intent`.
- Verify the `getGovernedChips()` call receives the updated intent from `detectIntent()` rather than the stale context value.

**Files**: `supabase/functions/selena-chat/index.ts`

---

## LOW Issues

### 6. Neighborhood card images appear dark on homepage
**Investigation needed**: Check `HomepageNeighborhoodCards.tsx` for overlay opacity. Likely the dark gradient overlay is too aggressive or hero images haven't loaded.

**Fix**: Reduce overlay opacity from current value to a lighter setting, or add a loading skeleton/placeholder.

**Files**: `src/components/v2/neighborhood/HomepageNeighborhoodCards.tsx`

### 7. Guide listing has apparent duplicates
**Root cause**: Guides appear in "Start With These" featured section AND in their category section. This is by design for discoverability but looks like a bug.

**Fix**: Add a visual distinction — featured guides in "Start With These" get a small "Featured" badge, making it clear the duplication is intentional. Alternatively, exclude featured guides from their category sections.

**Files**: `src/pages/v2/V2Guides.tsx`

---

## Implementation Order

1. **Critical #1** — Spanish greeting fix (highest user impact, 40% of market)
2. **Critical #3** — Contact page email (5-minute fix)
3. **Medium #5** — Buyer chips fix (edge function change)
4. **Critical #2** — Net-to-seller standalone page
5. **Medium #4** — Chip navigation keeping drawer open
6. **Low #6** — Neighborhood card overlay
7. **Low #7** — Guide duplicate clarity

## Technical Notes

- Issues #1, #3, #6, #7 are frontend-only changes
- Issue #2 is a new page + route (frontend only, reuses existing calculator)
- Issue #5 requires an edge function update + deploy
- Issue #4 requires reviewing the `resolveAction` flow across `actionSpec.ts` and the chips component
- No database migrations needed
- No breaking changes to existing behavior

