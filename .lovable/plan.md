

# Conversion Optimization Audit

## Page-by-Page CTA Analysis

| Page | Terminal CTA | Issue | Severity |
|---|---|---|---|
| `/` (Home) | CTASection → `/book` + Selena | Strong. Journey fork + tools + final CTA. | OK |
| `/sell` | Bottom CTA → Selena only | **No direct `/book` CTA.** High-intent sellers must go through Selena to book. | HIGH |
| `/buy` | Bottom CTA → Selena only | **No direct `/book` CTA.** Same issue as Sell. | HIGH |
| `/cash-offer-options` | Calculator next steps + Selena | Good tool-to-CTA bridge. Missing direct `/book` fallback at bottom. | MEDIUM |
| `/guides` | SelenaSynthesisFooter | Good — contextual. | OK |
| `/neighborhoods` | Hero Selena CTA only | **No bottom CTA.** User scrolls 15 cards and hits footer with no conversion point. | HIGH |
| `/community` | Bottom CTA → Selena only | **No `/book` option** at bottom. Mid-page Selena prompt is good. | MEDIUM |
| `/podcast` | Bottom CTA → YouTube subscribe only | **Zero conversion CTA.** Page ends with external YouTube link — complete funnel leak. | CRITICAL |
| `/about` | Bottom → `/book` + Selena | Strong dual-path. | OK |
| `/contact` | Bottom → `/book` + Selena | Good. | OK |
| `/selena-ai` | Bottom → Selena + `/book` | Good. | OK |
| `/market` | Needs check — but likely Selena-only | MEDIUM |

---

## Critical Issues

### 1. CRITICAL: `/podcast` — Zero Conversion Path
The podcast page ends with "Subscribe on YouTube" — an external link that sends visitors off-site. No `/book` CTA, no Selena prompt at the bottom. This is the only page in the entire site that leaks 100% of traffic to an external destination without a conversion opportunity.

### 2. HIGH: `/sell` and `/buy` — Missing Direct Booking CTA
Both hub pages terminate with "Ask Selena" as the sole CTA. For high-intent visitors who are ready to book, forcing them through Selena adds an unnecessary step. The `/about` page already demonstrates the correct dual-CTA pattern (Book + Selena fallback).

### 3. HIGH: `/neighborhoods` — No Bottom CTA
After browsing 15 neighborhood cards, there is no conversion prompt. The page simply ends with the grid. Visitors who scrolled the entire page have high engagement but no next step.

### 4. MEDIUM: `/cash-offer-options` — No Bottom Booking Fallback
The calculator flow handles conversion well, but visitors who skip the calculator and scroll to the bottom only see educational content. The final section has no CTA.

### 5. MEDIUM: Homepage Section Count — Cognitive Overload
The homepage has **10 distinct sections** before the final CTA (Hero → Fork → Banner → Calculator → About → Neighborhoods → TrustBar → Services → Selena AI → Testimonials → Podcast → Community → CTA). On mobile, this is ~15+ screen heights. Users in the "Evaluating" cognitive stage may fatigue before reaching the conversion point.

---

## Funnel Friction Points

### Long Decision Paths
- **Sell page flow**: Hero → 3-step process → 4 cards → Tool strip → Guide → Testimonials → Reviews → Comparison panels → Bottom CTA = **9 scroll sections** before conversion
- **Homepage**: 13 sections before final CTA

### Cognitive Friction
- **Contact form** captures email but does NOT pass the message body to any backend — the `message` field is collected but never sent to the edge function. Users think they sent a message; Kasandra never sees it.
- **Sell/Buy bottom CTAs** say "Ask Selena to Set Up My Call" — this implies booking but actually opens generic Selena chat. Expectation mismatch.

### Trust Signal Gaps
- **Google Reviews** section is lazy-loaded and may not render if API fails — no static fallback testimonials on the Sell page below the fold
- **No trust signals on `/neighborhoods`** — no credentials, no reviews, no testimonials

---

## Implementation Plan

### P0 — Fix Contact Form Data Loss (Bug)
**File:** `src/pages/v2/V2Contact.tsx`
The `handleSubmit` function calls `upsert-lead-profile` but does not include the `message` field. Fix: add `notes: message.trim()` to the edge function body.

### P1 — Add Dual-CTA (Book + Selena) to 4 Pages
Apply the same pattern used on `/about`:
1. **`/sell`** (line ~407): Replace Selena-only bottom CTA with Book primary + Selena secondary
2. **`/buy`** (line ~234): Same treatment
3. **`/neighborhoods`** (line ~101): Add a full bottom CTA section before closing
4. **`/podcast`** (line ~168): Replace YouTube-only bottom with Book primary + YouTube secondary + Selena tertiary

### P2 — Add Mid-Page Booking Anchor on `/cash-offer-options`
After the "When Cash Makes Sense" section (line ~277), add a compact `/book` CTA for users who don't want to use the calculator.

### P3 — Sticky Mobile CTA on Sell + Buy Pages
Add a fixed-bottom "Book a Call" bar on mobile (visible after scrolling past the hero) to short-circuit the long scroll. Uses the same pattern as the Selena floating button but for booking.

### P4 — Trust Signal on Neighborhoods Page
Add a compact TrustBar or credentials strip between the hero and the grid on `/neighborhoods`.

**Total: ~6 files changed. No structural refactors. All changes follow existing component patterns.**

