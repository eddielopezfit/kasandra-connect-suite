

# Digital Concierge Hub — UX Audit

## Confusion Points

### 1. Homepage Intent Fork Opens Chat Instead of Navigating (HIGH)
The 3-card journey fork ("I'm looking to buy / sell / cash offer") opens the Selena chat drawer. Users clicking "I'm looking to buy" expect to land on `/buy` — not a chat window. The card text says "Get your free buying game plan" which implies a page or tool, not a conversation. This creates an immediate expectation mismatch on the first meaningful interaction.

**Fix:** Change the intent fork cards to navigate to the corresponding hub page (`/buy`, `/sell`, `/cash-offer-options`) while still setting the session intent. Open Selena as a secondary action (toast or banner on the destination page), not the primary click result.

### 2. Guides Hub Has 7 Layers Before the Grid (HIGH)
On `/guides`, a first-time visitor sees: Hero → CognitiveProgressBar → DecisionLane → IntentJourneyMap → ContextualSelenaPrompt → ContinueReadingCard → RecommendedCarousel → SearchBar → CategoryNav → Grid. That's **9 distinct UI layers** before a single guide card is visible. On mobile, this is 6+ screen heights of meta-navigation before content.

The DecisionLane, IntentJourneyMap, and ContextualSelenaPrompt all serve similar purposes (intent routing + Selena prompt). The cognitive overhead is high for a first-time visitor who just wants to browse.

**Fix:** Collapse the pre-grid sections. For first-time visitors (no intent set, no guides read), show only: Hero → DecisionLane → CategoryNav → Grid. Move the IntentJourneyMap inside a collapsible "Your Journey" sidebar or accordion within the grid section. Show the ContextualSelenaPrompt only after the user has read 1+ guides (it already has stage awareness — just gate visibility).

### 3. "Start Here" Tab in Selena Duplicates Homepage Fork (MEDIUM)
The ConciergeTabBar's "Start Here" panel shows the same 3 intent choices ("I'm thinking about selling", "I'm looking to buy", "Just exploring") that the homepage fork already presented. If a user already declared intent on the homepage, the "Start Here" tab correctly shows next steps — but for new users opening Selena from a guide page, it resets them to intent selection even though their browsing context (e.g., reading a selling guide) already implies intent.

**Fix:** When Selena opens from a guide page (`source: 'guide_handoff'`), infer intent from the guide category and skip the intent selection step. The `openChat` call already passes `guideCategory` — use it to pre-set `effectiveIntent` in the Start Here panel.

### 4. "My Options" Tab Shows Seller Tools to Explorers (MEDIUM)
When no intent is set, the "My Options" panel shows all 3 options with seller-focused "See what I might walk away with" as the first card. For a user who opened Selena from a buyer guide, this is confusing — the first option is about selling.

**Fix:** When `effectiveIntent` is undefined and the user opened from a buyer guide/page, default to buyer-first ordering. Use the current page path as a fallback signal.

---

## Cognitive Overload

### 5. Homepage: 14 Sections, No Mid-Page Anchoring (HIGH)
The homepage has 14 sections. After the intent fork (section 2), users enter a long scroll with no wayfinding. There's no visual indicator of "where am I" or "what's next." The sections alternate between brand content (About, Community) and functional content (Calculator, Services, Selena AI) with no clear grouping.

**Fix:** Add a thin "section progress" indicator on the right edge (desktop) or use distinct background color groupings to create visual "chapters": Discovery (Hero → Fork → Calculator), Trust (About → TrustBar → Testimonials), Services (Services → Selena AI), Community (Podcast → Community → CTA). This groups the 14 sections into 4 cognitive chunks.

### 6. Guides Grid: 30+ Cards With No Hierarchy Cues (MEDIUM)
When "All Guides" is selected, 30+ cards render in a flat 3-column grid. Tier 1 cards have images but Tier 2/3 cards are visually identical. Users scanning the grid have no way to identify "start here" vs "deep dive" without reading every title.

**Fix:** Already partially addressed by the thumbnail system. Add a subtle "Start Here" badge to the top 3 guides in each category for first-time visitors (similar to how Netflix surfaces "Top 10" within genres).

---

## Unclear Paths

### 7. Selena Chat Has No "Back to Site" Navigation (MEDIUM)
Inside the Selena chat drawer, the ConciergeTabPanels offer navigation to guides and tools, but there's no breadcrumb or "return to where I was" option. If a user opened Selena from `/guides/cash-offer-guide`, engaged in conversation, then wants to return to that guide, they must close the drawer and manually navigate back.

**Fix:** Add a small "Return to [Guide Name]" link at the top of the chat when opened from a specific page context. The `source` and `guideId` are already tracked in the open event.

### 8. Calculator → Report → Book Flow Has No Visual Thread (LOW)
Users who complete the Instant Answer Widget on the homepage get results inline but no clear "next step" beyond the results. The calculator exists as a standalone section with no explicit connection to the Selena chat or booking flow below it.

**Fix:** After calculator results render, show a contextual CTA: "Want Kasandra to review these numbers with you?" → `/book`. This bridges the self-service tool to the human consultation.

---

## Missing Guidance

### 9. No Onboarding for Selena Chat (HIGH)
When Selena opens for the first time, the user sees an empty chat with a greeting message and suggested reply chips. There's no explanation of what Selena can do, what the tabs mean, or how the concierge system works. The 4-tab bar (Start Here, Guides, My Options, Talk) is unexplained.

**Fix:** Add a one-time "first open" state that shows a 3-bullet overlay: "I can help you explore neighborhoods, run the numbers on your home, or connect you with Kasandra." This dismisses on first interaction and never shows again (stored in localStorage).

### 10. No "What Can I Ask?" Prompt in Empty Chat (MEDIUM)
When the chat has no messages (fresh session), the only guidance is the greeting and chips. There's no placeholder content explaining Selena's capabilities in the message area itself.

**Fix:** Show 3-4 example question cards in the empty message area (like ChatGPT's initial state): "What's my home worth?", "Am I ready to buy?", "How do cash offers work?", "What neighborhoods fit my budget?" These send the message on click.

---

## Implementation Plan

### P1 — Fix Intent Fork Navigation (Homepage)
**File:** `src/pages/v2/V2Home.tsx` (lines 110-167)
Change the 3 fork buttons from `openChat()` to `navigate()` calls to `/buy`, `/sell`, `/cash-offer-options`. Keep `updateSessionContext({ intent })` but remove `clearHistory()` and `openChat()`. Add a Selena banner on the destination pages if not already present.

### P2 — Collapse Guides Pre-Grid Layers
**File:** `src/pages/v2/V2Guides.tsx` (lines 300-400)
Gate `IntentJourneyMap`, `ContextualSelenaPrompt`, and `ContinueReadingCard` behind `guidesReadCount > 0`. First-time visitors see only Hero → DecisionLane → CategoryNav → Grid. Returning visitors get the full layered experience.

### P3 — Add Selena First-Open Onboarding
**File:** `src/components/selena/SelenaChatDrawer.tsx`
Add a `selena_onboarded` localStorage flag. On first open, render a dismissible overlay card with 3 capability bullets and example prompts. Dismiss on any interaction.

### P4 — Add Empty-State Example Questions
**File:** `src/components/selena/drawer/SelenaDrawerMessagesArea.tsx`
When `messages.length === 0`, render 4 clickable example question cards in the message area. Each sends its text as a message on click.

### P5 — Infer Intent from Guide Context in Selena
**File:** `src/components/selena/ConciergeTabPanels.tsx` (StartHerePanel)
When `effectiveIntent` is undefined, check if the chat was opened with a `guideCategory` source. Map `buying` → `buy`, `selling`/`valuation` → `sell`, `cash` → `cash`. Skip the intent selection step and show next steps directly.

### P6 — Add "Return to" Context Link in Chat
**File:** `src/components/selena/SelenaChatDrawer.tsx`
Track the `source` page path when chat opens. If the user navigated away, show a small "← Back to [page name]" link below the header.

**Total: 6 files changed. No structural refactors. All changes follow existing patterns.**

