

# UX Optimization: Remove Redundancy, Compress Bio, Fix Sticky Bar Collision

Four strategic changes to tighten the hub's conversion architecture.

---

## Change 1: Remove "Not sure yet?" Selena Link

**File:** `src/pages/v2/V2Home.tsx` (lines 142-153)

Delete the "Not sure yet? Let Selena help you figure it out" text link below the 3 intent cards. The Selena Prompt Banner (navy bar, lines 157-174) sits directly below and serves the same purpose with better visual authority. Removing the text link eliminates CTA stacking.

---

## Change 2: Compress "Meet Kasandra" Section

**File:** `src/pages/v2/V2Home.tsx` (lines ~270-435)

The current section is ~165 lines with full bio, 4 credential bullets, video embed, and lifestyle photo — duplicating the About page. Replace with a compact card:

- Photo (desert landscape) + 2-line tagline + "Learn more about Kasandra" link to `/about`
- Remove the video embed, credential bullets, and lifestyle photo from Home
- Keeps the section to ~30 lines total
- The About page remains the canonical bio destination

---

## Change 3: Create Reusable `KasandraPortrait` Component

**New file:** `src/components/v2/KasandraPortrait.tsx`

A standardized image component that:
- Uses `aspect-[3/4]` ratio with `object-top` positioning (prevents head cropping)
- Accepts `size` prop (`sm | md | lg`) for consistent sizing across pages
- Applies standard border, shadow, and rounded corners from brand tokens
- Used in: V2Home (compressed bio), V2About, V2Contact

---

## Change 4: Fix Mobile Sticky Bar Collision

**Problem:** V2Layout renders a generic sticky "Book a Strategy Session" bar on all pages. V2Buy and V2Sell also render their own `StickyMobileBookingBar` with intent-specific CTAs. On those pages, two bars stack.

**Fix in `src/components/v2/V2Layout.tsx`:**
- Add `/buy` and `/sell` to the `SUPPRESS_STICKY_BOOK` array (line ~121), so the generic bar hides when the page-specific one is active.

---

## Files Changed

| File | Action |
|------|--------|
| `src/pages/v2/V2Home.tsx` | Remove "Not sure yet?" link; compress Meet Kasandra section |
| `src/components/v2/KasandraPortrait.tsx` | New reusable portrait component |
| `src/components/v2/V2Layout.tsx` | Add `/buy`, `/sell` to `SUPPRESS_STICKY_BOOK` |
| `src/pages/v2/V2About.tsx` | Swap img tags for `KasandraPortrait` |
| `src/pages/v2/V2Contact.tsx` | Swap img tag for `KasandraPortrait` |

