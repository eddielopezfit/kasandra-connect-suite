

# Two Fixes: Kill Proactive Popup + Explain JourneyRail Flow

## 1. Remove ProactiveSelenaPrompt (the popup)

The floating "You've done great research" toast in the bottom-right is `ProactiveSelenaPrompt`, rendered globally in `V2Layout.tsx`. It fires based on behavioral triggers (3+ guides read, 2+ neighborhoods viewed, etc.) but it's distracting and redundant — the hub already has contextual CTAs, the floating Selena button, and the JourneyRail guiding users forward.

**Action**: Remove the `ProactiveSelenaPrompt` import and usage from `V2Layout.tsx`. The component file itself can stay (dead code cleanup later) or be deleted now.

### Files
- **`src/components/v2/V2Layout.tsx`** — Remove import and `<ProactiveSelenaPrompt />` from render
- **`src/components/v2/ProactiveSelenaPrompt.tsx`** — Delete file

## 2. JourneyRail — How It Works (Your Question)

Yes, it works exactly like you described. Each stop is a clickable `<Link>` that navigates to a destination:

```text
Step 1: Understand → /home-valuation
Step 2: Compare    → /cash-offer-options
Step 3: Prepare    → /seller-decision
Step 4: Connect    → /book?intent=sell
```

When the user completes a tool at the destination (e.g., submits a valuation request), that stop turns green with a checkmark. The next incomplete stop becomes the active gold-highlighted one. The user clicks through the board game stops sequentially, each one unlocking the next.

**Current gap**: The rail only shows for returning users (`journeyDepth !== 'new'`). First-time visitors on `/sell` never see it. This is intentional — new users haven't set intent yet. But once they interact with anything (address entry, quiz click, Selena chat), intent gets set and the rail appears on their next visit or page navigation.

**No code changes needed on JourneyRail** — the mechanics are sound and working as designed.

## 3. Bonus: Stale Life Insurance Copy

Line 378 still says "I come from life insurance — protection is in my DNA." This was flagged earlier as irrelevant. Will update to align with current brand voice.

**Action**: Replace with brand-aligned copy that doesn't reference life insurance.

### Summary of Changes
1. **`src/components/v2/V2Layout.tsx`** — Remove ProactiveSelenaPrompt
2. **`src/components/v2/ProactiveSelenaPrompt.tsx`** — Delete
3. **`src/pages/v2/V2Sell.tsx`** — Update "How I Protect" intro paragraph (remove life insurance reference)

