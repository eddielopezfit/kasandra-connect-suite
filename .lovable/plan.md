

# Fix Mode Progression: Wire Missing Context Fields

## Problem
`sendMessage()` sends 8 fields to `selena-chat`; the server expects 17. Mode 2-to-3-to-4 progression is broken because `tool_used`, `quiz_completed`, `guides_read`, and `last_tool_result` are never sent.

## Scope
- **FILES MODIFIED: 1** (`src/contexts/SelenaChatContext.tsx`)
- No new files, no new tracking systems, no new counters or arrays
- No UI or copy changes

## What Changes

In the `sendMessage` function (lines ~577-588), expand the `context` object to include fields that **already exist** in `SessionContext` or `SelenaChatContext` provider state:

| Field | Source | Default |
|-------|--------|---------|
| `tool_used` | `SessionContext.tool_used` | `undefined` |
| `last_tool_result` | `SessionContext.last_tool_result` | `undefined` |
| `quiz_completed` | `SessionContext.quiz_completed` | `false` |
| `guides_read` | `context?.last_guide_id ? 1 : 0` | `0` |
| `situation` | `SessionContext.situation` | `undefined` |
| `calculator_advantage` | `lastCalculatorAdvantage` (existing provider state) | `undefined` |

### Omitted (not already stored in state)
- `entry_source` -- only exists as a transient param in `openChat()`, not persisted in state or ref
- `calculator_difference` -- only exists in the `EntryContext` object passed to `openChat()`, not stored
- `last_guide_title` -- no title stored anywhere, only `last_guide_id`

## Exact Code Change

The context object inside the fetch body becomes:

```typescript
context: {
  // existing fields (unchanged)
  session_id: context?.session_id || '',
  route: location.pathname,
  language: languageRef.current,
  utm_source: context?.utm_source,
  utm_campaign: context?.utm_campaign,
  intent: context?.intent,
  last_guide_id: context?.last_guide_id,
  lead_id: leadId,
  // new fields from SessionContext
  tool_used: context?.tool_used,
  last_tool_result: context?.last_tool_result,
  quiz_completed: context?.quiz_completed ?? false,
  guides_read: context?.last_guide_id ? 1 : 0,
  situation: context?.situation,
  // new field from provider state
  calculator_advantage: lastCalculatorAdvantage ?? undefined,
},
```

## Why This Fixes Mode Progression

The server's `buildConversationState()` reads these fields directly:

```text
guidesRead: context.guides_read || 0        // was always 0, now 1 if guide read
toolUsed: !!context.tool_used               // was always false, now true after calculator
quizCompleted: !!context.quiz_completed     // was always false, now true after quiz
hasToolResult: !!context.last_tool_result   // was always false, now true after calculator
```

`detectMode()` uses these to gate Mode 3 (needs `guidesRead >= 3 OR hasToolResult OR quizCompleted`) and Mode 4 (needs `toolUsed && userTurns >= 2`).

## Verification

After wiring, seller journey steps 2-5 should progress:
- **Turn 2 with `tool_used` set**: `detectMode` checks `toolUsed && userTurns >= 2` -- Mode 4 triggers, `allowBookingCTA: true`
- **`quiz_completed: true`**: Mode 3 triggers via `quizCompleted` flag
- **`last_tool_result` set**: Mode 3 triggers via `hasToolResult`
- **No signals**: Stays Mode 2 (no regression)
