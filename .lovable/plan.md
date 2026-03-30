

# Full Hub Audit — UI/UX + Code

## Architecture & Code Health

### Strengths
- Clean route architecture: 30 routes, all lazy-loaded with a proper skeleton fallback
- Consistent V2Layout wrapper with SelenaChatProvider, scroll management, analytics
- Proper bilingual governance via LanguageContext + t() pattern throughout
- Session intelligence system (VIP context, journey progress, session snapshots) is sophisticated and well-integrated
- Edge functions are properly secured with ADMIN_SECRET where cost-bearing
- RLS policies are correctly configured (public reads, service role writes)
- Brand tokens are consistent (cc-navy, cc-gold, cc-ivory, cc-sand)
- Analytics layer is comprehensive (logEvent, logCTAClick, sessionTrail)

### Issues Found

**1. Missing SEO Route Meta for /listings**
`seoRouteMeta.ts` has no entry for `/listings`. This means social crawlers get no OG tags for the listings page.

**2. Missing /listings in sitemap.xml**
The public sitemap likely doesn't include `/listings` — needs verification and update.

**3. V2Layout main padding creates gap on desktop**
`pb-20 lg:pb-0` — the `pb-20` exists to clear the sticky mobile booking bar. But on pages where the bar is suppressed (buy, sell, book, etc.), this creates 80px of unnecessary bottom padding on mobile.

**4. Navigation mobile menu — 15 links is overwhelming**
The mobile menu lists ALL 15 nav links vertically. On a 390px viewport, this is a very long scroll. The "Explore" dropdown pattern only works on desktop — mobile flattens everything.

**5. Contact form missing phone field**
The contact form on `/contact` captures name, email, and message but no phone number. This is a missed lead capture opportunity — phone is the highest-value field for GHL follow-up. The booking form has it, but the contact form doesn't.

**6. Homepage vertical scroll depth is extreme**
The homepage has 10+ sections: Hero → Journey Fork → VIP → Selena Banner → About Kasandra → TrustBar → Services (3 cards) → Selena Showcase → Calculator Widget → Featured Listings → Neighborhoods → Testimonials → Google Reviews → Corner Connect Advantage → Podcast → Community. On mobile at 390px, this is approximately 15+ screens of scroll. Most visitors won't reach the bottom sections.

**7. Duplicate CTA patterns**
Both "Book a Strategy Call" and "Ask Selena" appear in heroes AND bottom CTAs across Buy, Sell, and Home pages. The bottom CTA sections are near-identical across pages — could be a shared component to reduce maintenance.

**8. PropertyCard — sold card CTA loops back to /listings**
When a user clicks "See Active Listings" on a sold card, they're already on `/listings`. The CTA should scroll to the active tab or switch tabs, not navigate to the same page.

**9. No error boundary on FeaturedListingsSection**
If the Supabase query fails, the homepage listings section will throw. The homepage should gracefully degrade (it does return `null` on empty, but not on error).

**10. GlassmorphismHero has duplicated secondary CTA logic**
Lines 305-323 — both the `if` and `else` branches render identical JSX. The conditional serves no purpose.

**11. Orphaned hooks confirmed**
`src/hooks/useConsultationForm.ts` and `src/components/v2/ConsultationFormFields.tsx` are still present per CLAUDE.md, safe to delete.

**12. sync-listings TODO is live**
`supabase/functions/sync-listings/index.ts` has the IDX Broker TODO — this is expected and correct per plan.

## UX Findings

### Strengths
- Journey-aware UI (returning users see different headlines, breadcrumbs, VIP cards)
- Click-first chip governance prevents cognitive overload
- Tool strips show completion state (checkmarks for finished tools)
- Bilingual parity is thorough — nearly every string has EN/ES
- Trust signals are well-placed (brokerage strip, equal housing, review counts)
- Kasandra Proximity pattern on /sell (ready users see booking CTA earlier) is smart

### Issues Found

**13. Mobile sticky bar + Selena FAB overlap**
The sticky mobile booking bar sits at `bottom-0 z-40`. The Selena floating button is also bottom-right. On small screens, these can visually collide. Pages that suppress the sticky bar are fine, but pages like `/neighborhoods`, `/guides`, `/about` show both.

**14. Navigation — intent badge on desktop shows "Buying" even on irrelevant pages**
The intent badge (e.g., "Buying") shows in the nav unless you're on a conflicting page (buy/sell cross-intent). But it shows on pages like `/podcast`, `/community`, `/privacy` where it adds no value and takes up nav space.

**15. V2Book — dossier loading spinner on first visit**
First-time visitors who click "Book" see a spinner + "Kasandra is reviewing your profile" message. But there's no profile to review for a first-time visitor. This creates a false expectation. The 600ms delay (`setTimeout(enrichBooking, 600)`) adds latency for no benefit on cold sessions.

**16. Homepage "Check Your Buying Power" section assumes buyer intent**
The InstantAnswerWidget is buyer-focused, but the homepage serves all intents. Sellers and cash-offer seekers scroll past a buyer tool that's irrelevant to them.

**17. No 404 branding**
`NotFound.tsx` should be checked — it likely uses default styling rather than the cc-brand tokens and V2Layout wrapper.

## Recommended Priority Actions

### P0 — Fix Now (breaks SEO/UX)
1. Add `/listings` to `seoRouteMeta.ts`
2. Fix PropertyCard sold CTA (don't navigate to same page)
3. Remove duplicate GlassmorphismHero secondary CTA branch

### P1 — Fix Soon (polish)
4. Add phone field to Contact form
5. Fix V2Book dossier spinner for first-time visitors (show only if session has data)
6. Fix mobile sticky bar + Selena FAB z-index overlap

### P2 — Improve (quality of life)
7. Group mobile nav into sections (Primary / Explore) with visual divider
8. Extract shared bottom CTA section into reusable component
9. Delete orphaned hooks (useConsultationForm, ConsultationFormFields)
10. Add error boundary to FeaturedListingsSection
11. Trim homepage sections or make lower sections lazy-load with intersection observer (they already are lazy, but consider priority)

### Not Broken (No Action Needed)
- Brand tokens: consistent
- Edge function security: verified
- RLS policies: correct
- Analytics: comprehensive
- Bilingual: thorough
- Session intelligence: working
- Guard state hierarchy: intact

