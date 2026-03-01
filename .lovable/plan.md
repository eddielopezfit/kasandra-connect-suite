

# Apply 4 Regression Fixes to ConciergeTabPanels.tsx

Single file: `src/components/selena/ConciergeTabPanels.tsx` — 4 surgical edits.

---

### Fix #1 — Add `useEffect` import (line 7)

```ts
// Before
import { useState } from 'react';
// After
import { useState, useEffect } from 'react';
```

### Fix #2 — Try/catch in `resetJourneyIntent` (lines 36–51)

Replace the bare `JSON.parse` with a safe wrapper:

```ts
function resetJourneyIntent(): void {
  const raw = localStorage.getItem(CONTEXT_KEY);
  let ctx: any = {};
  try { ctx = raw ? JSON.parse(raw) : {}; } catch { ctx = {}; }

  delete ctx.intent;
  delete ctx.timeline;
  if (ctx.intent === null) delete ctx.intent;
  if (ctx.timeline === null) delete ctx.timeline;

  ctx.chip_phase_floor = 1;
  ctx.current_mode = 1;

  localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
}
```

### Fix #3 — Add `useEffect` sync after `useState` (after line 82)

Insert immediately after the `useState` block, before `if (!activeTab)`:

```ts
useEffect(() => {
  setEffectiveIntent(getSessionContext()?.intent as Intent | undefined);
}, [activeTab, currentIntent]);
```

### Fix #4 — Safe `intentNextSteps` lookup (line 231)

Replace:
```ts
{(intentNextSteps[effectiveIntent!] || []).map((step) => (
```
With:
```ts
{(isIntentLocked && effectiveIntent ? intentNextSteps[effectiveIntent] ?? [] : []).map((step) => (
```

---

No other files changed. No string changes needed — all ES labels confirmed matching CHIP_ACTION_MAP via normalization.

