# Architecture: GHL Webhook Payload Standard

## Canonical Route (ALL functions must follow this)

ALL functions that need to notify GHL MUST call `notify-handoff` (not fetch GHL directly).

### Correct Pattern (create-handoff, submit-valuation-request)
```typescript
fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({ contact: {...}, context: {...} }),
});
```

### Why
- `notify-handoff` derives all tags (including score_hot/warm/cold, intent tags, language tags)
- `notify-handoff` derives pipeline stage
- `notify-handoff` logs GHL failures to event_log for observability
- Direct GHL calls bypass all of this — leads get wrong tags, wrong stages

## Score Fields (MUST be separate)

`lead_score` and `readiness_score` are DIFFERENT:
- `lead_score` = composite behavioral score (0-100) from `computeLeadScore()` — drives GHL routing
- `readiness_score` = seller-specific readiness from session snapshot — informational only
- Always pass BOTH in context when calling notify-handoff

## Score Bucket Tags (GHL Workflow Branching)

`notify-handoff.deriveTags()` now emits:
- `score_hot` → lead_score >= 75 or journey_state === "decide"
- `score_warm` → lead_score >= 45
- `score_cold` → lead_score < 45

These tags are required for GHL workflows WF-05, WF-09, WF-10 to branch correctly.

## Standard Tags (ALL seller leads MUST have these)

```typescript
["selena - intake completed", "selena - website lead", "selena_os_lead", "cc | entry |webhook"]
```
