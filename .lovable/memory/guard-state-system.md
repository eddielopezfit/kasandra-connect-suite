# Architecture: Guard State System

## File

`supabase/functions/selena-chat/guardState.ts` — **549 lines**

## Exports

- `buildGuardState()` — constructs initial guard state from conversation history
- `applyGuardRules()` — evaluates state and returns response constraints

## Key Types

- **`EmotionalPosture`**: anxious | overwhelmed | curious | calm | confident
- **`EscalationLevel`**: none | suggest | offer | booked | human_takeover
- **`ConversationGuardState`** tracks: identity_disclosed, intent/timeline lock, emotional_posture, escalation_level, guide_history, reentry_flag, consecutive_similar_turns, containment_active, vulnerability_signal_count
- **`GuardRulesResult`** returns: guardHints (injected into system prompt), chipOverrides, maxTokensOverride, blockGeneration

## KB-9 Containment Overlay

Triggers on:
- High-severity keywords: 'scam', 'lowball', 'dont trust'
- 2+ vulnerability signals within 6 turns

When active:
- Enforces 1-2 sentence limit (50-120 tokens)
- Ceases educational content
- Switches to validation-only responses

## Governance Hierarchy

KB-0 > Brokerage Truth > Conversational Doctrine > **STATE GUARD** > Mode Instructions

## Critical Rule

> **Never bypass.** Any refactor touching governance must preserve this file's logic intact.
> It is infrastructure, not prompt tuning.
