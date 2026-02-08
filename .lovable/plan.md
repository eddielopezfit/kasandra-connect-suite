# Selena Digital Concierge Communication Audit
## Complete Documentation of Patterns, Misalignments & Recommendations

**Status: ✅ GUIDES PAGE OPTIMIZATION COMPLETE (v3 - Decision Hub)**
*Implemented: 2026-02-08*

---

## 1. Executive Summary

This document tracks the evolution of Selena's integration and the Guides Page optimization following the "Digital Concierge / Earned Access" philosophy.

### Latest Implementation (v3)
The Guides Page has been transformed from a content index into a **Concierge-Driven Decision Hub** with:
- Color-coded category wayfinding
- Consolidated Selena entry points (Hero + Post-Grid Footer)
- Gated Summary CTA (3+ guides read)
- Decision Path Labels on guide cards
- Removed redundant CTA layers

---

## 2. Changes Implemented (v3 - Guides Page Optimization)

### ✅ P0.1: Category Color System

**New File**: `src/lib/guides/categoryColors.ts`

| Category | Color | Emotional Intent |
|----------|-------|------------------|
| Buying | Blue-600 | Trust, stability, safety |
| Selling | Emerald-600 | Growth, progress, moving forward |
| Valuation | Amber-600 | Insight, clarity, knowledge |
| Cash | Amber-700 | Speed, certainty, resolution |
| Financial | Navy | Security, planning, guidance |
| Neighborhoods | Violet-600 | Discovery, lifestyle, belonging |
| Stories | Rose-500 | Connection, empathy, warmth |
| Tips | Slate-600 | Practical, helpful, universal |

**Applied To**:
- Category filter chips (active = strong, inactive = subtle)
- Guide card left-edge accent bar
- Category pill badges

### ✅ P0.2: Reduced Pre-Grid Layers

Before the guide grid, the page now has max 2 layers:
1. PersonalizedHero (with single Selena CTA)
2. StartHereLane OR SituationLane OR RecommendedCarousel (conditional)

**Removed**:
- Standalone ContextualSelenaPrompt section
- Idle prompt timeout logic

### ✅ P0.3: Consolidated Selena Entry Points

**Hero CTA**: "Start with Selena" → Navigation assistance for new visitors

**Post-Grid Footer**: `SelenaSynthesisFooter.tsx`
- Gated "Summarize what I've learned" (only if `guidesReadCount >= 3`)
- Always-visible "Ask a question"
- Position: After guide grid, before final CTA section

**Removed from**:
- CognitiveProgressBar (now pure context, no CTAs)
- Mid-page standalone section

### ✅ P0.4: CognitiveProgressBar Simplified

**Before**: Progress bar + stage label + microcopy + 2 CTAs
**After**: Compact horizontal row with progress dots + stage badge + affirmation

**New Human-Centered Labels**:
| Level | Before | After (EN) |
|-------|--------|------------|
| 2 | Exploring | Finding Your Way |
| 3 | Understanding | Building Clarity |
| 4 | Clarifying | Narrowing Down |
| 5 | Deciding | Ready to Move Forward |

**Affirmations Added**:
- Level 2: "You're making progress. Take your time."
- Level 3: "You're building a clear picture. That's the goal."
- Level 4: "You know more than when you started. Trust that."
- Level 5: "When you're ready, support is here. No rush."

### ✅ P0.5: Decision Path Labels

**New**: Each guide card shows a decision-context label.

| Guide | Label |
|-------|-------|
| first-time-buyer-guide | Decision: Start Buying |
| selling-for-top-dollar | Decision: Sell vs Wait |
| cash-offer-guide | Decision: Speed vs Price |
| tucson-neighborhood-guide | Decision: Where to Live |
| (stories) | Story: [Category] Success |

---

## 3. Files Created/Modified

### Created
- `src/lib/guides/categoryColors.ts` - Color config + decision labels
- `src/components/v2/guides/SelenaSynthesisFooter.tsx` - Post-grid Selena entry

### Modified
- `src/components/v2/guides/CognitiveProgressBar.tsx` - Removed CTAs, compacted
- `src/components/v2/guides/index.ts` - Added SelenaSynthesisFooter export
- `src/pages/v2/V2Guides.tsx` - Applied all P0 changes

---

## 4. Selena CTA Strategy (Final)

| Location | CTA | When Shown | Behavior |
|----------|-----|------------|----------|
| Hero | "Start with Selena" | Always | Opens chat for navigation |
| Post-Grid | "Summarize what I've learned" | `guidesRead >= 3` | Prefills summary request |
| Post-Grid | "Ask a question" | Always | Opens chat empty |
| Footer | "Book a Consultation" | Always | Routes through Selena |

**Behavior Contract**:
- Summary CTA: Selena references guides read, highlights key takeaways
- Question CTA: Selena asks clarifying question, suggests relevant guide
- Footer CTA: Selena pre-qualifies before offering booking

---

## 5. Visual Hierarchy (Final)

```
┌──────────────────────────────────────────────────────────┐
│ HERO: Personalized headline + "Start with Selena" CTA   │
├──────────────────────────────────────────────────────────┤
│ CONDITIONAL: StartHereLane | SituationLane | Carousel   │
├──────────────────────────────────────────────────────────┤
│ PROGRESS BAR: Compact dots + stage + affirmation        │
├──────────────────────────────────────────────────────────┤
│ STICKY NAV: Color-coded category chips                  │
├──────────────────────────────────────────────────────────┤
│ GUIDE GRID: Cards with color accent + decision labels   │
├──────────────────────────────────────────────────────────┤
│ SYNTHESIS FOOTER: Selena summary/question CTAs          │
├──────────────────────────────────────────────────────────┤
│ AUTHORITY FOOTER: Soft consultation CTA                 │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Previous Remediation (v2 - Still Active)

### Earned Access Gate (Selena Chat)
Booking CTAs in Selena chat remain gated:
- User explicitly asks to book
- Tool completed (calculator, quiz)
- 2+ user turns with non-explore intent

### Intent Normalization
- `cash_offer` → `cash`
- `exploring` → `explore`
- Write-once guard on lead_profiles

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| Pre-grid scroll distance | < 1 screen |
| Selena entry points | 2 (Hero + Footer) |
| Guide click clarity | Color = category |
| Summary CTA visibility | Only 3+ guides |
| Booking pressure | Zero until footer |

---

*Audit completed. Guides Page now functions as a Decision Hub with concierge-first navigation.*
