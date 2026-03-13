

## Plan: Add "What This Means" Lines to Market Pulse Card

**File:** `src/components/v2/hero/GlassmorphismHero.tsx`

### Change 1: Add `insight` prop to StatItem (lines 13-29)

Add optional `insight?: string` to `StatItemProps` and render it below the label as `text-xs italic mt-0.5 text-cc-ivory/50`.

### Change 2: Pass insight strings to each StatItem (lines 278-293)

Add `insight={t("...", "...")}` to each of the three `<StatItem>` calls:

- **Sale-to-List:** "Buyers have slight negotiating room right now" / "Los compradores tienen algo de margen de negociación"
- **Median Days on Market:** "Overpriced homes sit for months — pricing strategy matters" / "Las casas sobrevaloradas permanecen meses en el mercado"
- **Holding Cost Per Day:** "Every month unsold costs sellers ~$540" / "Cada mes sin vender cuesta ~$540 al vendedor"

**No other files modified.**

