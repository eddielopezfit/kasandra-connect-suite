

# Fix: Market Pulse Showing "January" Instead of "March 2026"

## Root Cause

Two issues combined:

1. **Empty `market_pulse` table** — the automated pipeline (pg_cron) hasn't fired yet, so `get-market-pulse` falls back to the legacy `market_pulse_settings` table, which has `last_verified_date: 2026-02-01`.

2. **Timezone parsing bug** — Line 89 of `useMarketPulse.ts` does `new Date("2026-02-01")`, which JavaScript parses as UTC midnight. In Arizona (UTC-7), that renders as **January 31, 2026**, so `toLocaleDateString()` outputs "January 2026".

## Fix Plan

### 1. Fix the timezone bug in `useMarketPulse.ts` (line 89)

Append `T12:00:00` to date-only strings so timezone offset can't roll the date backward:

```typescript
} else if (isLive && pulse.last_verified_date) {
    const d = new Date(pulse.last_verified_date + "T12:00:00");
    month = d.toLocaleDateString(locale, { month: "long", year: "numeric" });
    verifiedDate = month;
}
```

### 2. Update `market_pulse_settings.last_verified_date` to March 2026

Use the insert tool (data update, not schema) to set the current date:

```sql
UPDATE market_pulse_settings
SET last_verified_date = '2026-03-19',
    updated_at = now()
WHERE market_name = 'Tucson_Overall';
```

This immediately fixes the display. When the pg_cron pipeline runs on April 1st (or is triggered manually), it will seed the `market_pulse` table and the new pipeline path will take over, bypassing this legacy code entirely.

### 3. Also fix the same timezone bug for the Spanish month translation (line 82)

```typescript
const d = new Date(pulse.month + " 1, 12:00:00");
```

---

**Files changed**: 1 (`src/hooks/useMarketPulse.ts`)
**Data update**: 1 SQL UPDATE on `market_pulse_settings`

