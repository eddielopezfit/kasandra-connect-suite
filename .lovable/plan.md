

# Fix: Surface `selena_convo_summary` as Top-Level GHL Payload Field

## Problem
The GHL custom field `contact.selena_convo_summary` exists but receives no data. The AI-generated conversation summary is only nested inside `selena_dossier_json` (line 349) — GHL cannot map nested JSON keys to contact fields.

## Fix
Add one line to the payload object in `supabase/functions/notify-handoff/index.ts`, after the existing field mappings (around line 324, before `tags`):

```typescript
selena_convo_summary: context.convo_summary ?? "",
```

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/notify-handoff/index.ts` | Add 1 line — top-level `selena_convo_summary` field in payload |

No other changes needed. The `convo_summary` value is already passed from `create-handoff` into the notify payload's `context` object — it just needs surfacing as a standalone key.

