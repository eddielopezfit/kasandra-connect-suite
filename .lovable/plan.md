

# Fix: Build-Breaking Apostrophes in Single-Quoted Strings

## Root Cause

Two files contain single-quoted (`'...'`) JavaScript strings that include English apostrophes (`'s`, `'re`). The apostrophe terminates the string early, producing cascading parse errors that prevent the build from completing.

## Affected Files and Lines

### 1. `src/lib/guides/howToSchemas.ts` (lines 426-776)

10 guide schemas use single-quote delimiters. Broken lines include:
- Line 442: `'In Tucson's market...'`
- Line 526: `'Evaluate your home's condition'`
- Line 562: `'...you're relocating...'`
- Line 670: `'Arizona's flat 2.5%...'`
- Line 692: `'...servicer's loss...'`
- Line 696: `'...you're underwater'`
- Line 720: `'Kasandra's market...'`
- Line 754: `'...Tucson's market.'`
- Line 760: `'...seller's market...'`
- Line 772: `'...buyer's agent...'`

**Fix:** Convert all string values in lines 426-776 from single quotes to double quotes. Lines 1-425 already use double quotes and are fine.

### 2. `src/pages/v2/V2GuideDetail.tsx` (lines 311-327)

Three `descEn` values in the `seoOverrides` object use smart/curly apostrophes inside single-quoted strings:
- Line 314: `what's included`
- Line 320: `family's interests`
- Line 326: `home's value`

**Fix:** Convert these three string values to double quotes.

## Scope

- Two files only
- Purely mechanical quote delimiter change — no content modifications
- No logic, routing, or other file changes

