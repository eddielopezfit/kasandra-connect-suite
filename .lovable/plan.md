

# Plan: Match Google Studio Visual Details

## 4 Changes

### 1. Gold Floating Chat Bubble with Hover Tooltip
**File:** `src/components/selena/SelenaFloatingButton.tsx`
- Change bubble color from `bg-primary` to `bg-cc-gold text-cc-navy`
- Add a tooltip on hover: "Chat with Selena" (EN) / "Hablar con Selena" (ES) using Radix Tooltip
- Match the Google Studio gold bubble exactly

### 2. Gold "Ask Selena About My Options" Button
**File:** `src/pages/v2/V2CashOfferOptions.tsx` (line 162-168)
- Change from `variant="heroOutline"` to solid gold: `bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold`
- Matches the Google Studio gold CTA button style

### 3. Gold Center Chat Icon in "Meet Selena AI" Section
**File:** `src/pages/v2/V2Home.tsx` (lines 477-488)
- Change the concentric circles from `bg-white/10` and `bg-white/20` to `bg-cc-gold/20` and `bg-cc-gold/40`
- Change the MessageCircle icon from `text-white/80` to `text-cc-navy`
- Add a solid gold inner circle background matching the Google Studio screenshot

### 4. Expand Community Section from 2 to 4 Organizations
**File:** `src/pages/v2/V2Home.tsx` (lines 598-608)
- Add "Leadership Tucson" (star icon) and "Community Advocate" (heart-handshake icon)
- Change grid from `grid-cols-2` to `grid-cols-2` with 4 items (2x2 grid)
- Bilingual labels for all 4 organizations matching Google Studio: Arizona Diaper Bank, Rumbo al Éxito, Leadership Tucson, Community Advocate

