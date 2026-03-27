

# End-User Journey Audit — "Does This Feel Like a Wow?"

## Verdict: 96% Blue Ocean — 4% Friction

The architecture is genuinely exceptional. A user IS guided throughout the entire journey via 7 interconnected intelligence layers. The personalization is real, not cosmetic. Here's the honest assessment:

---

## What Makes This Blue Ocean (The Wow)

**Layer 1 — Intent Fork (Homepage)**: Three clear cards (Buy / Sell / Cash Offer) immediately set session intent. No cognitive overload. Returning users see "Welcome back — continue where you left off" with their JourneyBreadcrumb showing completed milestones.

**Layer 2 — Session Intelligence Banner**: Reflects the user's actual behavior back to them ("You've completed 2 tools. Your picture is getting clearer.") with contextual CTAs. This is the "I feel understood" moment.

**Layer 3 — Predictive Engine**: 6-rule priority system surfaces the right next action at the right time. Not generic "Learn More" buttons — intent-aware, journey-depth-aware recommendations like "You've done great research. Now let's see what actually fits your numbers."

**Layer 4 — Tool Chaining**: Every tool result page shows `ToolResultNextStep` with the contextually correct next action. No dead ends.

**Layer 5 — Proactive Selena**: 5 behavioral triggers fire after 8 seconds with calm, observant prompts. Dismissible, session-aware, with cooldown.

**Layer 6 — Readiness Snapshot**: Score-banded (Exploring / Getting Ready / Ready to Move) with priority-specific insights and intent-aware next steps. This is where users feel "educated and confident."

**Layer 7 — Escalation Banner**: High-intent signals trigger booking nudges without being aggressive. Dismissible, once-per-session.

**Tools are simple**: Each tool is a multi-step wizard (3-4 steps) with progress bars, back buttons, and clear outcomes. The ReadinessSnapshot translates scores into human bands, not raw numbers.

---

## Issues Found (The 4%)

### 1. CRITICAL — `ContextualChatPrompt` is Broken (Orphan + Dead Click Handler)

The component exists but has two problems:
- Its `onClick` tries to find `document.querySelector('[data-widget-id]')` — a GHL chat widget that no longer exists. It does NOT use `openChat` from `SelenaChatContext`.
- It's not imported or used anywhere in the app.

**Impact**: Zero — it's unused. But if anyone imports it, the button does nothing.

**Fix**: Either delete it (it's an orphan) or rewire it to use `openChat` for potential future use.

### 2. MEDIUM — No "Explore" Intent Path After Homepage Fork

The homepage fork offers Buy / Sell / Cash. A user who doesn't identify with any of these (first-time explorer, relocating, just curious) has no clear entry point. They must scroll past the fork to find content.

**Fix**: Add a subtle fourth option below the three cards: "Not sure yet? Let Selena help you figure it out" — opens chat with `source: 'homepage_explore'`.

### 3. LOW — `deriveNextAction` Falls Through to Generic "Ask Selena" for Dual/Investor/Explore Intent

Users with `dual`, `investor`, or `explore` intent get the generic fallback "Ask Selena" as their next recommended action. There's no tool-specific path for these intents.

**Fix**: Add a `dual` path that recommends `/seller-decision` first (sell clarity before buy), and an `explore` path that recommends `/neighborhoods` or `/guides`.

### 4. LOW — Guides Hub ContextualSelenaPrompt Uses Correct `openChat` but Homepage's ContextualChatPrompt Does Not

The Guides Hub uses `ContextualSelenaPrompt` (from `src/components/v2/guides/`) which correctly integrates with Selena. The orphan `ContextualChatPrompt` does not. No user impact since the orphan is unused, but confirms it should be deleted.

---

## Implementation Plan

### Step 1: Delete orphan `ContextualChatPrompt.tsx`
Dead code with broken handler. Clean removal.

### Step 2: Add "Not sure yet?" explore path on homepage
Below the Buy/Sell/Cash fork cards, add a text link: "Not sure yet? Let Selena help you figure it out" that opens Selena with `source: 'homepage_explore'` and `intent: 'explore'`.

### Step 3: Enrich `deriveNextAction` for dual/explore intents
- `explore` → recommend `/neighborhoods` (area exploration is the natural entry for curious users)
- `dual` → recommend `/seller-decision` (sell-side clarity first, then buy)

### Files Modified
- `src/components/v2/ContextualChatPrompt.tsx` — delete (orphan)
- `src/pages/v2/V2Home.tsx` — add explore CTA below fork cards
- `src/hooks/useJourneyProgress.ts` — add `dual` and `explore` paths to `deriveNextAction`

**Estimated scope**: 1 implementation message. All three changes are small and independent.

