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
- [ ] lastVerifiedDate set if guide contains market-sensitive data

## Selena Flow
- [ ] Chips resolve to registered ActionSpecs (no conversational-only chips in Phase 2+)
- [ ] Topic hints added to modeContext.ts if keyword detection needed
- [ ] No changes to selena-chat/index.ts unless strictly required
- [ ] Bilingual chip labels ≤28 chars (Spanish)

## General
- [ ] No duplicate of existing asset
- [ ] TypeScript builds clean
- [ ] Mobile-responsive (test at 390px width)
