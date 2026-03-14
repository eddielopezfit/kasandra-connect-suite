

## V2SelenaAI Overhaul — Simulated Conversation Demo

### File 1: `src/components/v2/selena/SelenaConversationDemo.tsx` (new, ~200 lines)

**iPhone-style chat frame:**
- Outer: `bg-cc-navy rounded-3xl overflow-hidden shadow-luxury max-w-[600px] mx-auto`
- Top bar: darker navy strip with green dot, "Selena" label, "AI Concierge • Bilingual" subtext
- Scrollable message area with bottom padding

**Message bubbles:**
- User: `ml-auto bg-cc-gold text-cc-navy rounded-2xl rounded-tr-sm max-w-[80%]`
- Selena: `mr-auto bg-white/10 text-cc-ivory rounded-2xl rounded-tl-sm max-w-[80%]`

**Auto-play engine:**
- `IntersectionObserver` triggers playback once (useRef flag)
- State: `visibleMessages` array built up over time via `setTimeout` chain
- Sequence per message pair:
  1. User message fades in after 800ms
  2. Typing indicator (3 CSS-animated dots) appears for 1200ms
  3. Selena message revealed word-by-word (30ms/word) via a `displayedWords` counter in state
- Total: ~25s for 6 messages
- After complete: gold CTA button fades in + small replay icon

**Conversation script (hardcoded array):**
```
[
  { role: 'user', lang: 'en', text: "Do I qualify for a VA loan? I served 4 years active duty." },
  { role: 'selena', lang: 'en', text: "Thank you for your service 🇺🇸 Yes — with 4 years active duty..." },
  { role: 'user', lang: 'es', text: "¿Y si soy DACA? ¿Puedo comprar también?" },
  { role: 'selena', lang: 'es', text: "¡Claro que sí! Los beneficiarios de DACA pueden calificar..." },
  { role: 'user', lang: 'en', text: "That's amazing. How do I get started?" },
  { role: 'selena', lang: 'en', text: "Let's start with a 20-minute strategy call with Kasandra..." },
]
```

**Props:** `onStartChat: () => void` for the CTA callback.

---

### File 2: `src/pages/v2/V2SelenaAI.tsx` (full rewrite)

**Section 1 — Hero (lines 57-72 area, updated):**
- Keep badge, h1, subtitle
- Add primary gold CTA button immediately below subtitle: "Try Selena Now →" → `openChat`
- Above the fold, no scroll needed

**Section 2 — Conversation Demo (new):**
- `bg-cc-navy py-16` section
- Import and render `<SelenaConversationDemo onStartChat={...} />`
- Caption below: "Real answers. Real situations. No scripts." — `text-cc-ivory/50 text-sm italic`

**Section 3 — Feature Cards (existing doesItems, upgraded):**
- Keep 4 cards in `sm:grid-cols-2`
- Add hover effect: `border border-transparent hover:border-cc-gold/50 transition-all duration-300`
- Remove the "What Selena Doesn't Do" section entirely (TOS feel)

**Section 4 — Compliance (keep as-is, lines 108-118)**

**Section 5 — Bottom CTA (upgraded):**
- Primary: "Start Talking to Selena →" gold button → `openChat`
- Secondary: ghost outline button "Book with Kasandra Instead" → navigate `/book`
- Stack vertically with `gap-3`

**Removed:** The "What Selena Doesn't Do" section — this is the TOS content driving people away. The compliance section already covers the legal requirements.

---

### No other files modified
- `SelenaConversationDemo` receives `onStartChat` prop — no context dependency
- Bilingual handled via `t()` passed from parent or inline since the demo script is hardcoded bilingual by design (both languages shown simultaneously as part of the demo)

