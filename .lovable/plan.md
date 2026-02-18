
# Phase 1 — Selena Suppression During Quiz + Result-Specific CTA Wiring

## Objective

Enforce single-objective funnel discipline: the quiz has ONE job (completion). Selena UI must be invisible during quiz steps and activated only on the results screen with full intent context from the quiz outcome.

## Current State Analysis

### The Problem
`QuizFunnelLayout` unconditionally renders `<SelenaFloatingButton />` and `<SelenaChatDrawer />` at all times:

```text
QuizFunnelLayout (renders always)
  ├── top bar
  ├── <main>{children}</main>  ← V2HomePathQuizContent lives here
  ├── compliance footer
  ├── <SelenaFloatingButton />  ← ALWAYS visible ❌
  └── <SelenaChatDrawer />      ← ALWAYS mounted ❌
```

The `isComplete` boolean that controls quiz vs. results screen lives **inside** `V2HomePathQuizContent` — it is not accessible to `QuizFunnelLayout` from outside.

### Additional Bugs Found on Results Screen
- **Option A ("Chat with Selena")** calls `window.location.href = "/v2"` — this navigates the user entirely off the quiz page instead of opening Selena in-context. This is a critical logic error.
- **Option B ("Talk with Kasandra")** calls `openChat({ source: 'hero', intent: 'explore' })` — wrong `source` (should be `quiz_result`), wrong `intent` (should be derived from quiz path, not hardcoded `'explore'`).
- `'quiz_result'` is not a recognized `EntrySource` in `SelenaChatContext.tsx` or `entryGreetings.ts`, so there is no specialized greeting for quiz completion. It currently falls through to the generic `floating` default.

## Architecture: State Lift Pattern

The cleanest solution without a global store or context is to **lift `isComplete` up** to the `V2HomePathQuiz` wrapper and pass it to `QuizFunnelLayout` as a prop:

```text
Before:
V2HomePathQuiz
  └── QuizFunnelLayout            ← renders Selena always
        └── V2HomePathQuizContent ← owns isComplete

After:
V2HomePathQuiz                    ← owns isComplete (lifted)
  └── QuizFunnelLayout(isQuizComplete) ← renders Selena only when true
        └── V2HomePathQuizContent(onComplete) ← calls onComplete on submit success
```

This requires:
- `QuizFunnelLayout` gets a new optional `showSelena?: boolean` prop (defaults `false`)
- `V2HomePathQuizContent` gets a new `onComplete?: () => void` callback prop
- `V2HomePathQuiz` wrapper owns `isComplete` state and wires both

## File Changes

### 1. `src/contexts/SelenaChatContext.tsx` — Add `'quiz_result'` to EntrySource

**Line 44** — add `'quiz_result'` to the `EntrySource` union type:

```typescript
| 'quiz_result'; // After completing the path quiz — intent-specific routing
```

This ensures TypeScript accepts `source: 'quiz_result'` in `openChat()` calls and that the analytics logger receives a valid source string.

### 2. `supabase/functions/selena-chat/entryGreetings.ts` — Add quiz_result greeting

**Line 28** — add `'quiz_result'` to the local `EntrySource` union in this file (it has its own copy).

**After line 77** in `generateEntryGreeting()` switch — add a new `case 'quiz_result':` that calls a new `generateQuizResultGreeting()` function.

The new greeting acknowledges the completed quiz and routes based on intent:

```
EN (sell): "You've just completed your path — and it looks like selling is on your mind. Based on what you shared, here are two things that will help you move forward..."
EN (buy):  "You've just completed your path — and you're thinking about buying. That's a great place to start. Here's what usually helps most at this stage..."
EN (cash): "You've just completed your path — and cash offer options caught your attention. That's worth exploring. Let me help you understand what that actually means for your home..."
EN (explore): "You've just completed your path — and it's okay that things aren't fully clear yet. Let's figure out your most useful next step together."

ES variants follow the same bilingual lock pattern.
```

Suggested replies are intent-specific:
- **sell/cash**: `["What's my home worth?", "Compare cash vs. traditional", "Talk with Kasandra"]`
- **buy**: `["Take the readiness check", "What should I prepare?", "Talk with Kasandra"]`
- **explore**: `["Help me figure out my path", "Show me my options", "Just exploring"]`

### 3. `src/components/v2/QuizFunnelLayout.tsx` — Add `showSelena` prop

Add `showSelena?: boolean` to the `QuizFunnelLayoutProps` interface.

Change the Selena rendering block at the bottom of the JSX from unconditional to conditional:

```typescript
// Before (lines 74-75):
<SelenaFloatingButton />
<SelenaChatDrawer />

// After:
{showSelena && <SelenaFloatingButton />}
{showSelena && <SelenaChatDrawer />}
```

The `SelenaChatProvider` **stays mounted at all times** (wrapping everything) — this is critical because `openChat()` must be callable from inside `V2HomePathQuizContent` even before `showSelena` is true. The provider gives the context; the UI components are what gets suppressed.

### 4. `src/pages/v2/V2HomePathQuiz.tsx` — Lift state + fix result CTAs

**A) Lift `isComplete` to wrapper**

The outer `V2HomePathQuiz` component gains `useState<boolean>` for `isQuizComplete`. It passes `showSelena={isQuizComplete}` to `QuizFunnelLayout` and `onComplete={() => setIsQuizComplete(true)}` to `V2HomePathQuizContent`.

**B) `V2HomePathQuizContent` accepts `onComplete` prop**

The `setIsComplete(true)` call at line 386 (after successful edge function submission) gains a companion `onComplete?.()` call immediately after:

```typescript
setIsComplete(true);
onComplete?.(); // Signal layout to reveal Selena UI
```

**C) Fix result screen CTAs (lines 462–525)**

Replace all three current CTA buttons on the results screen with intent-derived versions:

**Primary CTA — "Chat with Selena" (full-width gold card)**

Currently: `onClick={() => window.location.href = "/v2"}` — navigates away. ❌

Replace with: `onClick={() => openChat({ source: 'quiz_result', intent: path === 'buying' ? 'buy' : path === 'selling' ? 'sell' : path === 'cash' ? 'cash' : 'explore' })}`

This keeps the user on-page and opens Selena with the correct quiz-result source and the exact intent derived from the quiz outcome.

**Option B — "Talk with Kasandra"**

Currently: `openChat({ source: 'hero', intent: 'explore' })` — wrong source, wrong intent. ❌

Replace with: `openChat({ source: 'quiz_result', intent: derivedIntent })` — consistent source and correct intent.

**Option C — "Continue Exploring" (cash path only)**

For the `cash` result path, replace `<Link to="/v2/guides">` with `<Link to="/v2/cash-offer-options">`. The cash user should go to the calculator page, not the generic guide library. For all other paths, the guides link is appropriate and stays.

The derived intent mapping used in both CTAs:

```typescript
const derivedIntent = path === 'buying' ? 'buy' 
  : path === 'selling' ? 'sell' 
  : path === 'cash' ? 'cash' 
  : 'explore';
```

This is computed once and reused for all three CTAs on the results screen.

## Files Changed Summary

| File | Change |
|---|---|
| `src/contexts/SelenaChatContext.tsx` | Add `'quiz_result'` to `EntrySource` union (1 line) |
| `supabase/functions/selena-chat/entryGreetings.ts` | Add `'quiz_result'` to local `EntrySource` union + new `generateQuizResultGreeting()` function + `case 'quiz_result':` in switch |
| `src/components/v2/QuizFunnelLayout.tsx` | Add `showSelena?: boolean` prop; conditionally render `<SelenaFloatingButton />` and `<SelenaChatDrawer />` |
| `src/pages/v2/V2HomePathQuiz.tsx` | Lift `isComplete` to wrapper; pass `onComplete` callback; fix 3 result CTA buttons; fix cash path "Continue Exploring" destination |

## What Does NOT Change

- `SelenaChatProvider` placement — stays wrapping everything in `QuizFunnelLayout` (context must remain available for `openChat()` to work on the results screen)
- All quiz question logic, answer handling, auto-advance timing
- The `handleSubmit` function — only `onComplete?.()` is appended after the existing `setIsComplete(true)` call
- Phone validation, GHL sync, edge function payload
- `QuizFunnelLayout` top bar, compliance footer, language toggle, back-to-home link
- All compliance language, bilingual strings, `t()` calls
- The `resultContent` data object (headlines, validation copy, helpful steps bullets)
- Analytics events — `logPageView` still fires on route change

## Behavior After Implementation

```text
Quiz Step 1-6 (active questions + contact form):
  ✅ No floating button
  ✅ No chat drawer
  ✅ No proactive Selena messages
  ✅ SelenaChatProvider is mounted (context available but UI hidden)

Results Screen (isComplete === true):
  ✅ Floating button appears
  ✅ Drawer available
  ✅ Primary CTA calls openChat({ source: 'quiz_result', intent: derivedIntent })
  ✅ Selena greets with quiz-result-specific message (acknowledges completed quiz)
  ✅ "Talk with Kasandra" also routes through Selena with correct intent
  ✅ Cash path "Continue Exploring" routes to /v2/cash-offer-options
```
