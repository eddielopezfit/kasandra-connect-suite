

## Guide Search Bar — Implementation Plan

**File: `src/pages/v2/V2Guides.tsx`** (only file modified)

### Edit 1 — Line 3: Add `Search` icon import
```typescript
import { BookOpen, Home, TrendingUp, Calculator, ArrowRight, DollarSign, Calendar, MessageCircle, Search } from "lucide-react";
```

### Edit 2 — Line 178: Add search state
After the `activeIntent` state declaration, add:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

### Edit 3 — Lines 215-218: Replace `filteredGuides` with combined category + search filter
```typescript
const filteredGuides = useMemo(() => {
  let guides = activeCategory === "all"
    ? educationalGuides
    : educationalGuides.filter(guide => guide.category === activeCategory);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    guides = guides.filter(guide =>
      guide.title.toLowerCase().includes(q) ||
      (guide.titleEs ?? '').toLowerCase().includes(q) ||
      guide.description.toLowerCase().includes(q) ||
      (guide.descriptionEs ?? '').toLowerCase().includes(q)
    );
  }
  return guides;
}, [activeCategory, educationalGuides, searchQuery]);
```

### Edit 4 — Between lines 383-384: Insert search bar before the sticky category nav
```tsx
{/* Search Bar */}
<div className="bg-cc-ivory py-6 border-b border-cc-sand-dark/30">
  <div className="container mx-auto px-4 flex justify-center">
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cc-slate/50" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t("Search guides...", "Buscar guías...")}
        className="w-full bg-white border border-cc-sand-dark/30 rounded-full pl-10 pr-5 py-3 text-cc-charcoal placeholder:text-cc-slate/50 focus:outline-none focus:ring-2 focus:ring-cc-gold/40 focus:border-cc-gold/30 transition-all"
      />
    </div>
  </div>
</div>
```

### Edit 5 — Inside the grid (after line 414): Add empty-state message
After the opening `<div className="grid ...">` tag, before the `.map()`:
```tsx
{filteredGuides.length === 0 && searchQuery.trim() && (
  <div className="col-span-full text-center py-16">
    <p className="text-cc-charcoal/60 text-lg">
      {t(`No guides found for "${searchQuery}"`, `No se encontraron guías para "${searchQuery}"`)}
    </p>
  </div>
)}
```

### Summary

| Location | Change |
|----------|--------|
| Line 3 | Add `Search` to lucide imports |
| Line 178 | Add `searchQuery` state |
| Lines 215-218 | `filteredGuides` → `useMemo` with category + search |
| After line 383 | Search bar UI between carousel and sticky nav |
| After line 414 | Empty-state message when no results |

No other files touched. Search works alongside category filters — both active simultaneously.

