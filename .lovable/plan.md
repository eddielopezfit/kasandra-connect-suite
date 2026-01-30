

# Chat UI Optimization & Submission Error Fix
## Desktop Right-Panel, Modal Polish, Submission Fix & Guide-Aware Greeting

---

## SUMMARY

This plan addresses four interconnected enhancements:

1. **Desktop UI Optimization**: Move Selena from bottom drawer to right-side Sheet on desktop (768px+), with minimize capability
2. **Modal Polish**: Refine the "Access Your Report" modal with clean centered Dialog
3. **Submission Fix**: Ensure CORS headers and null-safe dossier for Oasis Shield compatibility
4. **Guide-Aware Greeting**: Selena's greeting mentions the current guide title when opened on guide pages

---

## TASK 1: Desktop UI Optimization (Right-Side Pivot)

### Current State
`SelenaChatDrawer.tsx` uses a bottom `Drawer` component for all screen sizes.

### Target State
- **Mobile (<768px)**: Keep current bottom drawer behavior
- **Desktop (≥768px)**: Use right-aligned `Sheet` taking 30-35% of screen width
- **Minimize Feature**: Collapse to a floating bar showing "Selena is active" instead of closing completely

### Implementation

**File**: `src/components/selena/SelenaChatDrawer.tsx`

```typescript
// Add imports
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Minus } from 'lucide-react';

// Add minimized state
const [isMinimized, setIsMinimized] = useState(false);
const isMobile = useIsMobile();

// Minimize handler
const handleMinimize = useCallback(() => {
  setIsMinimized(true);
  logEvent('selena_minimized', { route: window.location.pathname });
}, []);

// Restore from minimized
const handleRestore = useCallback(() => {
  setIsMinimized(false);
  logEvent('selena_restored', { route: window.location.pathname });
}, []);

// Reset minimized state when drawer closes
useEffect(() => {
  if (!isOpen) {
    setIsMinimized(false);
  }
}, [isOpen]);
```

### Conditional Rendering Logic

```tsx
// Minimized State (Desktop only)
if (!isMobile && isMinimized && isOpen) {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground 
                 px-4 py-2 rounded-full shadow-lg cursor-pointer 
                 flex items-center gap-2 hover:scale-105 transition-transform"
      onClick={handleRestore}
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">Selena is active</span>
    </div>
  );
}

// Mobile: Use Drawer (bottom sheet)
if (isMobile) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <DrawerContent className="h-[85vh] max-h-[700px] flex flex-col">
        {/* Current drawer content */}
      </DrawerContent>
    </Drawer>
  );
}

// Desktop: Use Sheet (right panel)
return (
  <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
    <SheetContent 
      side="right" 
      className="w-[400px] max-w-[35vw] p-0 flex flex-col h-full"
    >
      {/* Header with minimize button */}
      <SheetHeader className="border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Selena</span>
            <span className="text-sm font-normal text-muted-foreground">
              {tUI('Digital Concierge', 'Concierge Digital')}
            </span>
          </SheetTitle>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{uiLanguage === 'en' ? 'ES' : 'EN'}</span>
            </button>
            
            {/* Minimize Button (Desktop only) */}
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label={tUI('Minimize', 'Minimizar')}
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SheetHeader>
      
      {/* Rest of content (messages, input, etc.) - same as drawer */}
    </SheetContent>
  </Sheet>
);
```

### Analytics Events

Register new events in `logEvent.ts`:
- `selena_minimized`
- `selena_restored`

---

## TASK 2: Modal Polish (Access Your Report)

### Current State
`LeadCaptureModal.tsx` already uses:
- `Drawer` for mobile
- `Dialog` for desktop

This is already correctly implemented with the `useIsMobile()` hook.

### Verification Needed
The current implementation looks correct. The only enhancement needed is ensuring that `onSuccess` properly triggers `bridgeLeadIdToV2`.

### Current Code (Already Correct)
```typescript
// In handleSubmit, after success:
const leadId = data.lead_id;
setLeadIdentity(leadId); // This already persists lead_id

// Success callback
onSuccess?.(leadId);
```

The `setLeadIdentity` function in `SelenaChatContext.tsx` already saves to localStorage:
```typescript
const setLeadIdentity = useCallback((newLeadId: string) => {
  setLeadId(newLeadId);
  saveLeadId(newLeadId);
}, []);
```

### Enhancement
Add explicit `bridgeLeadIdToV2` call in `LeadCaptureModal.tsx` for full dossier sync:

```typescript
// After setLeadIdentity(leadId):
import { bridgeLeadIdToV2 } from "@/lib/analytics/bridgeLeadIdToV2";

// In handleSubmit success:
bridgeLeadIdToV2(leadId, source);
```

---

## TASK 3: Submission Fix (Oasis Shield Compatibility)

### Already Fixed
Based on previous implementation, the CORS headers in `submit-consultation-intake` have been updated to:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

### Already Fixed
The `getFullSessionDossier()` function in `useSessionPrePopulation.ts` already filters undefined values:

```typescript
// Filter out undefined values to prevent edge function issues
const dossier: Record<string, unknown> = {};
for (const [key, value] of Object.entries(fields)) {
  if (value !== undefined) {
    dossier[key] = value;
  }
}
```

### Verification
Test submission to confirm no more "Something went wrong" errors.

---

## TASK 4: Guide-Aware Greeting

### Current State
When Selena opens on a guide page, she shows a generic greeting.

### Target State
If `last_guide_id` is set in SessionContext (tracked by `V2GuideDetail.tsx`), Selena should reference the guide title in her greeting.

### Implementation

**File**: `src/contexts/SelenaChatContext.tsx`

Enhance the `openChat` function to detect guide context:

```typescript
import { getGuideById } from '@/lib/guides/guideRegistry';

const openChat = useCallback(() => {
  setIsOpen(true);
  logSelenaOpen(location.pathname);
  
  // Add greeting if no messages
  if (messages.length === 0) {
    const context = getSessionContext();
    let greetingContent: string;
    let suggestedReplies: string[];
    
    // Check if user is on a guide page
    const guideId = context?.last_guide_id;
    const guideEntry = guideId ? getGuideById(guideId) : null;
    
    if (guideEntry && location.pathname.includes('/v2/guides/')) {
      // Guide-aware greeting
      const guideTitle = language === 'es' ? guideEntry.titleEs : guideEntry.titleEn;
      
      greetingContent = t(
        `I see you're reading "${guideTitle}." Would you like a personalized checklist based on this guide?`,
        `Veo que estás leyendo "${guideTitle}." ¿Te gustaría una lista de verificación personalizada basada en esta guía?`
      );
      
      // Contextual suggested replies based on guide category
      if (guideEntry.category === 'buying') {
        suggestedReplies = [
          t("Yes, send me the checklist", "Sí, envíame la lista"),
          t("I have a question about buying", "Tengo una pregunta sobre comprar"),
          t("Not right now", "Ahora no"),
        ];
      } else if (guideEntry.category === 'selling' || guideEntry.category === 'valuation') {
        suggestedReplies = [
          t("Yes, send me the checklist", "Sí, envíame la lista"),
          t("What's my home worth?", "¿Cuánto vale mi casa?"),
          t("Not right now", "Ahora no"),
        ];
      } else {
        // Stories
        suggestedReplies = [
          t("I'd like similar guidance", "Me gustaría orientación similar"),
          t("Tell me more about your services", "Cuéntame más sobre tus servicios"),
          t("Not right now", "Ahora no"),
        ];
      }
    } else {
      // Default greeting
      greetingContent = t(
        "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
        "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarte a explorar tus opciones con calma y sin presión.\n\n¿Estás pensando en comprar, vender, o solo explorar qué es posible?"
      );
      suggestedReplies = [
        t("I'm thinking about selling", "Estoy pensando en vender"),
        t("I'm looking to buy", "Estoy buscando comprar"),
        t("Just exploring for now", "Solo estoy explorando"),
      ];
    }
    
    const greeting: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: greetingContent,
      timestamp: new Date().toISOString(),
      suggestedReplies,
    };
    setMessages([greeting]);
    saveHistory([greeting]);
  }
}, [messages.length, location.pathname, t, language]);
```

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `src/components/selena/SelenaChatDrawer.tsx` | MODIFY | Add mobile/desktop conditional rendering with Sheet, minimize state |
| `src/components/v2/LeadCaptureModal.tsx` | MODIFY | Add explicit `bridgeLeadIdToV2` call on success |
| `src/contexts/SelenaChatContext.tsx` | MODIFY | Add guide-aware greeting logic in `openChat` |
| `src/lib/analytics/logEvent.ts` | MODIFY | Register `selena_minimized` and `selena_restored` events |

---

## EXPECTED BEHAVIOR

### Desktop Flow
1. User opens Selena on desktop → Right-side Sheet appears (30-35% width)
2. User clicks minimize → Panel collapses to floating "Selena is active" bar
3. User clicks floating bar → Panel restores

### Mobile Flow
- No change from current behavior (bottom drawer)

### Guide-Aware Greeting
1. User reads "Spanish-Speaking Client Story" guide
2. User clicks Selena FAB
3. Greeting: "I see you're reading 'A Family Finds Home in Their Language.' Would you like a personalized checklist based on this guide?"
4. Pills: ["Yes, send me the checklist", "I'd like similar guidance", "Not right now"]

### Form Submission
1. User fills NativeGuideLeadCapture form
2. Submits successfully (no CORS errors)
3. Green success state appears
4. Lead identity bridged to localStorage

---

## VERIFICATION TESTS

1. **Desktop UI Test**:
   - Open browser on desktop (>768px)
   - Click Selena FAB
   - Verify right-side panel appears
   - Click minimize button
   - Verify floating bar appears
   - Click floating bar to restore

2. **Guide-Aware Greeting Test**:
   - Navigate to `/v2/guides/first-time-buyer-guide`
   - Open Selena Chat
   - Verify greeting mentions "First-Time Home Buyer's Complete Guide"
   - Verify contextual suggested replies appear

3. **Form Submission Test**:
   - Navigate to any guide page
   - Fill out NativeGuideLeadCapture form
   - Submit and verify green success state
   - Check console for no errors

---

## SUCCESS CRITERIA

1. On desktop, Selena appears as right-side panel (30-35% width)
2. Minimize button collapses to floating "Selena is active" bar
3. On mobile, bottom drawer behavior unchanged
4. Guide-aware greeting shows guide title when on guide pages
5. Form submissions complete without "Something went wrong" error
6. Lead identity properly bridged on successful submission

