

## P2 Cleanup — Two Quick Changes

### 1. Add missing EntrySource values to types.ts

**File:** `src/contexts/selena/types.ts`

Add three new union members to `EntrySource` (after `'sell_hero'` on line 39):

```
  | 'proactive_homepage'
  | 'buyer_fork'
  | 'seller_fork';
```

This removes the three `as any` casts in `V2Home.tsx` (lines 101, 136, 154). After adding the types, remove `as any` from all three lines.

### 2. Delete orphaned files

Both files have zero external imports — confirmed via search:

- `src/components/v2/ConsultationFormFields.tsx` — no imports outside itself
- `src/hooks/useConsultationForm.ts` — no imports outside itself

Delete both. The memory file `.lovable/memory/orphaned-components.md` already documents this decision.

### Summary

- **types.ts**: 3 lines added to union
- **V2Home.tsx**: 3 `as any` casts removed
- **2 files deleted**

Zero logic changes. Pure type safety and dead code removal.

