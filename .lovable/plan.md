

## QA Fix Plan — 7 Issues (IMPLEMENTED)

### ✅ Critical #1 — Spanish greeting persistence
- Added `greeting_language` metadata to `ChatMessage` interface
- `SelenaChatContext.tsx`: useEffect detects language mismatch in stored greeting, re-computes in correct language

### ✅ Critical #2 — Net-to-Seller standalone route
- Created `src/pages/v2/V2NetToSeller.tsx` with `TucsonAlphaCalculator`, CMA CTA, Selena CTA
- Route `/net-to-seller` registered in `App.tsx`
- SEO meta added to `seoRouteMeta.ts`, sitemap updated, actionSpec whitelist updated

### ✅ Critical #3 — Contact page email
- Added `mailto:kasandra@kasandraoasis.com` with Mail icon between Phone and Office sections

### ⏸ Medium #4 — Chip navigation closing drawer
- Code analysis: `resolveAction()` calls `navigate()` without `closeChat()`. Drawer state persists through route changes. Issue may not be reproducible — deferred to manual testing.

### ✅ Medium #5 — Buyer chips after buy intent
- Root cause confirmed: `getSuggestedReplies()` at lines 1224-1225 used `context.intent` (stale incoming) instead of `effectiveIntent` (freshly detected). Fixed to use `effectiveIntent`.

### ✅ Low #6 — Dark neighborhood cards
- Reduced gradient overlay from `from-black/50` to `from-black/35`

### ✅ Low #7 — Guide duplicate clarity
- Added "Featured" / "Destacada" badge to guides with `isFeatured` flag in the grid view
