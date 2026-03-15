

# Fix: howToSchemas.ts Build Errors

## Root Cause
Lines 426-776 use single-quote (`'...'`) string delimiters for content that contains English apostrophes (`Tucson's`, `you're`, `servicer's`, etc.). The apostrophe terminates the string early, causing cascading parse errors across ~100+ error locations.

Lines 1-425 use double quotes and work fine.

## Fix
Convert all single-quoted `name`, `nameEs`, `text`, `textEs`, `description`, `descriptionEs` string values in lines 426-776 to double-quoted strings. This is a mechanical change — no content modifications.

Affected guide schemas (all currently using single quotes):
- `selling-for-top-dollar` (lines 426-464)
- `inherited-probate-property` (lines 466-503)
- `cash-vs-traditional-sale` (lines 506-537)
- `sell-or-rent-tucson` (lines 540-571)
- `capital-gains-home-sale-arizona` (lines 574-606)
- `divorce-selling` (lines 608-640)
- `senior-downsizing` (lines 642-674)
- `distressed-preforeclosure` (lines 676-708)
- `sell-now-or-wait` (lines 710-742)
- `move-up-buyer` (lines 744-776)

## Scope
- Single file: `src/lib/guides/howToSchemas.ts`
- Lines 426-776 only — replace `'` string delimiters with `"` on all content fields
- No content changes, no logic changes, no other files

