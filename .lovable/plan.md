

## /contact Two-Column Rebuild

### Overview
Transform the current stacked-card contact page into a luxury two-column layout with Kasandra's portrait, a response-time promise, and smarter contact options. Single file modified: `src/pages/v2/V2Contact.tsx`.

### Layout

```text
┌──────────────────────────────────────────────────┐
│  HERO — same navy bg, updated subtitle           │
│  "Get in Touch" / "Ponerse en Contacto"          │
│  + response promise badge below headline         │
└──────────────────────────────────────────────────┘

┌─────────────────────┬────────────────────────────┐
│                     │                            │
│  Kasandra portrait  │  Contact card (phone,      │
│  (kasandra-         │  office, brokerage) +      │
│  portrait.jpg)      │  "Talk to Selena" button   │
│                     │  + social icons inline     │
│  Rounded, shadow,   │                            │
│  gold ring border   │  Response promise:         │
│                     │  "I respond within 2 hrs   │
│                     │  during business hours"    │
│                     │                            │
└─────────────────────┴────────────────────────────┘
│  Mobile: stacks vertically, portrait on top       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  BOTTOM CTA                                       │
│  Primary: "Book a Call with Kasandra" → /book     │
│  Ghost: "Talk to Selena First" → openChat         │
└──────────────────────────────────────────────────┘
```

### Changes to `V2Contact.tsx`

**Hero section** (lines 39-52):
- Add a response-promise pill below subtitle: `inline-flex bg-cc-gold/15 text-cc-gold rounded-full px-4 py-1.5 text-sm` with clock icon — "Typically responds within 2 hours" / "Responde en menos de 2 horas"

**Contact section** (lines 54-87):
- Replace `max-w-lg mx-auto` single card with `grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto`
- Left column: Kasandra portrait (`kasandra-portrait.jpg`) in a `rounded-2xl overflow-hidden ring-4 ring-cc-gold/20 shadow-elevated` frame
- Right column: existing contact details card + social icons moved inline here (remove separate social section)
- Add personal note: "Whether you prefer a call, a text, or meeting Selena first — I'm here." in `text-cc-text-muted italic text-sm`

**Social row** (lines 89-110):
- Remove as standalone section — social icons move into right column of the two-column layout as a horizontal row beneath the contact card

**Bottom CTA** (lines 112-129):
- Upgrade to dual-button: Primary gold "Book a Call" → `/book`, Ghost outline "Talk to Selena First" → `openChat`
- `bg-cc-sand` background for visual separation

**Import additions**: `kasandraPortrait` from assets, `Clock`, `Calendar` from lucide-react, `Link` from react-router-dom.

### Technical Notes
- Mobile (< lg): single column, portrait above contact card
- Uses existing `kasandra-portrait.jpg` asset already in `src/assets/`
- No new components or files needed
- Socials array stays as-is, just rendered in new location

