---
name: guard-state-system
description: Knowledge of the GuardState KB containment hierarchy in the selena-chat edge function. Use this whenever touching guardState.ts, modifying the system prompt hierarchy, or any task that could affect how Selena responds to sensitive topics, competitive questions, or out-of-scope requests.
---

# GuardState System — KB Containment Overlay

## What It Is
`supabase/functions/selena-chat/guardState.ts` (549 lines) is a containment overlay system that enforces a strict knowledge base (KB) hierarchy on every Selena response. It acts as a constitutional layer on top of the AI model's outputs.

## CRITICAL RULE
**Never bypass, reorder, or weaken the GuardState hierarchy.** This system protects Kasandra's brand, prevents competitive disclosure, and keeps Selena legally compliant as a real estate AI concierge.

## KB Hierarchy (Priority Order — Highest to Lowest)
```
KB-0            → Absolute prohibitions (never say, never do — non-negotiable)
Brokerage Truth → Kasandra-specific facts (brokerage, licensing, territory)
Conversational  → Doctrine of how Selena speaks and behaves
STATE GUARD     → The guardState.ts enforcement layer (this file)
Mode Instructions → Mode-specific behavior (Orientation/Clarity/Confidence/Handoff)
```

**KB-0 always wins.** If any instruction conflicts with KB-0, KB-0 takes precedence.

## CRITICAL TERMINOLOGY — Do Not Confuse These Two Systems

**Modes** (psychological progression — 4 states, one-directional per session):
- Orientation → Clarity → Confidence → Handoff
- Controlled by `modeContext.ts`
- Determines HOW Selena engages and WHEN booking CTAs are allowed

**Journey States** (TOFU/MOFU/BOFU — lead funnel classifier):
- TOFU = Top of funnel (exploring), MOFU = Middle (evaluating), BOFU = Bottom (deciding)
- Separate system used for lead scoring and GHL pipeline routing
- Do NOT conflate with modes — they are independent classifiers

## What guardState.ts Enforces
- Selena never recommends competitors or alternative agents
- Selena never quotes specific commission rates (legal compliance)
- Selena never makes pricing guarantees
- Selena redirects out-of-scope legal/financial questions appropriately
- Selena maintains persona consistency across all mode transitions
- Selena never breaks character or reveals she is an AI language model unless explicitly required

## Mode Hierarchy (Orientation → Clarity → Confidence → Handoff)
```
Mode 1 — ORIENTATION  → First contact. Educational, non-pushy. NEVER mention booking.
Mode 2 — CLARITY      → Intent declared or engaged. Suggest tools/guides. Still no booking.
Mode 3 — CONFIDENCE   → Deep engagement. Reflect on progress. No hard booking CTA.
Mode 4 — HANDOFF      → Ready to convert. allowBookingCTA: true. No persuasion needed.
```

Mode transitions are one-directional within a session — never regress a user backward without an explicit session reset.

## Safe Editing Rules for guardState.ts
1. Never remove a KB-0 prohibition
2. Never change the priority order of the 5 hierarchy levels
3. If adding a new guard rule, add it at the appropriate level — never above KB-0
4. Always test competitive question handling after any edit: "Should I use Zillow instead?" → Selena should redirect gracefully, not answer directly
5. Always test commission question handling after any edit: "What is your commission rate?" → Selena should redirect to Kasandra directly

## Relationship to System Prompt
guardState.ts injects its containment logic into the system prompt assembly in index.ts. The STATE GUARD section appears after Conversational Doctrine and before Mode Instructions in the assembled prompt. Do not move this injection point.

## Files That Interact With guardState.ts
- `supabase/functions/selena-chat/index.ts` — imports and applies guardState
- `supabase/functions/selena-chat/modeContext.ts` — operates within the mode layer below STATE GUARD

## What NOT to Do
- Do not add "helpful" exceptions to KB-0 rules for edge cases
- Do not expose guardState internals to the client (never return guard state in API responses)
- Do not use guardState.ts logic in any frontend component — it belongs exclusively in the edge function
- Do not use "TOFU/MOFU/BOFU" to refer to Selena's conversation modes — those are journey state classifiers, not modes
