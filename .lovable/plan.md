

## Analysis: Are the "I'm Selling" / "I'm Buying" Hero Pills Redundant?

**Short answer: Yes. Remove them.**

### The Redundancy Problem

The desktop nav already shows **Buy** and **Sell** as top-level links, permanently visible. The hero pills duplicate these exact destinations (`/v2/sell`, `/v2/buy`). On desktop, a user sees both the nav links AND the pills simultaneously — that's 4 paths to 2 destinations.

On mobile, the nav links are behind a hamburger menu, so the pills theoretically add value there. But the hero already has "Chat with Selena" as the primary CTA, and Selena's first question is always intent-based ("Are you buying or selling?"). The pills shortcut Selena's triage — which undermines the concierge model.

### Why Removal Is Correct

1. **Click-First philosophy says max 2 chips once intent is known.** On the home page, intent is NOT yet known. Showing intent chips before the user has engaged creates premature decision pressure — the exact cognitive overload the user flagged.

2. **Selena IS the router.** The architectural mandate says Selena handles intent detection and routing. Hero pills bypass this, sending cold visitors directly to orientation pages without context. Selena would have captured intent, timeline, and language preference first.

3. **The nav already covers it.** Buy and Sell are the 2nd and 3rd nav items. On mobile, they're one tap away in the hamburger. Adding them again in the hero is redundant surface area.

4. **Visual clutter.** The screenshot shows: hero title + subtitle + disclaimer + Chat with Selena button + 2 pills = 6 elements competing for attention in the hero. Removing the pills drops it to 4 — title, subtitle, disclaimer, one clear CTA. That's clean.

### What Changes

**File:** `src/pages/v2/V2Home.tsx` (lines 105-121)

Remove the entire intent pills block (the `<div className="flex gap-3 mt-4 ...">` containing the two `<Link>` elements). No replacement needed.

This is a 1-file, 17-line deletion. No other files affected.

