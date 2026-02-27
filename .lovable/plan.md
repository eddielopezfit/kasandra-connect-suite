

# Plan: Align Calculator Progress Bar, Timeline Layout, and /sell Page with Google Studio

## 3 Changes

### 1. Progress Bar — Show All 4 Stage Labels
**File:** `src/components/v2/calculator/CashOfferProgressBar.tsx`

The Google Studio build shows all 4 labels (EXPLORING, CALCULATING, COMPARING, DECIDING) displayed horizontally beneath each bar segment in uppercase. The current Lovable build only shows the active stage label on the left + "1/4" on the right.

- Replace the bottom row with a 4-column layout where each label sits under its segment
- Active/completed labels in `text-cc-gold font-semibold`, inactive in `text-cc-slate/60`
- Labels in uppercase `tracking-wider text-[10px]`
- Move the "1/4" counter to align right above the bar

### 2. Timeline Options — 2x2 Grid Layout
**File:** `src/components/v2/calculator/CalculatorInputs.tsx`

The Google Studio build shows timeline options in a 2x2 grid (2 columns, 2 rows) instead of a vertical stack. The motivation options remain stacked.

- Change timeline container from `space-y-3` (vertical stack) to `grid grid-cols-2 gap-3`
- Keep motivation options as vertical stack (matches Google Studio)

### 3. V2Sell Page — Gold Italic Accent Word + Layout Refinements
**File:** `src/pages/v2/V2Sell.tsx`

The Google Studio /sell hero has "Confidence" on a separate line in gold italic serif. The "How I Protect" section has a 2-column layout (left: text + numbered steps, right: 2x2 card grid). The "Your Selling Options" section has navy background on Traditional and outline on Cash with better contrast.

**Hero changes:**
- Split h1 into two lines: "Sell Your Home with" + "Confidence" in `text-cc-gold italic`
- Spanish: "Venda Su Casa con" + "Confianza"

**"How I Protect Sellers" section (lines 71-140):**
- Remove the navy header bar (move title into the section itself)
- Change to 2-column layout: left side has h2 "How I Protect Your Interests" + description text + 3 numbered steps (01 Strategic Analysis, 02 Risk Mitigation, 03 Expert Execution), right side has the 2x2 card grid
- Bilingual for all new content

**"Your Selling Options" section (lines 176-240):**
- Add "THE CHOICE IS YOURS" gold uppercase label above h2
- Traditional Listing card: navy background with white text, "Learn Listing Strategy →" button in gold
- Cash Offer card: dark navy/slate background with white text and gold accent, "Explore Cash Options →" button with gold outline

## Technical Details
- All changes are purely presentational (CSS/JSX restructuring)
- No new dependencies or database changes
- All content remains bilingual via `t()` helper

