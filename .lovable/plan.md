


# Knowledge Base Injection #3: Buyer & Seller Paths Overview — COMPLETED

# Conversational Operating Doctrine (Behavior Layer) — DEPLOYED

Inserted between Brokerage Truth Source Override and Voice Rules in both EN and ES prompts.
Governs tone, flow, booking rules, human takeover, and conversation progression.
Subordinate to KB-0. Deployed and verified 2026-02-23.

# Conversation State Guard v1.0 — DEPLOYED

Deterministic governance layer in `supabase/functions/selena-chat/guardState.ts`.
Integrated into `index.ts` between intent detection and AI generation.

Guard state fields: identity_disclosed, intent_locked, timeline_locked, emotional_posture,
escalation_level, guide_history, last_question_type, last_system_action, reentry_flag,
consecutive_similar_turns.

11 hard rules enforced pre-generation:
1. Identity Once (no re-introductions)
2. No Booking Without Gate (escalation_level gating)
3. No Repeat Guides (guide_history dedup)
4. No Urgency Assumption (timeline unknown → block urgency words)
5. No Re-Ask (intent_locked / timeline_locked)
6. One Question Rule (last_question_type tracking)
7. Overwhelm Gate (empathy-only + human handoff chips)
7b. Anxiety Loop Gate (anxious + looping → human only, never tools)
8. Post-Booking Silence (1 sentence, max_tokens=60)
9. Human Takeover Absolute (block generation)
10. Anti-Loop (consecutive_similar_turns ≥ 2)
11. Reentry — No Fresh Intro

Both surgical notes incorporated:
- Timeline uses semantic labels (urgent/soon/flexible/browsing/null) in doctrine;
  canonical DB values (asap/30_days/60_90) preserved in detection layer.
- Anti-loop + anxious → human_takeover only, never tools or booking.

Telemetry: guard_violations, guard_emotional_posture, guard_escalation_level in response JSON.
Deployed and verified 2026-02-23.
