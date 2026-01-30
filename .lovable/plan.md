
# Native Calendar Integration & Success State Finalization
## Embedding the Calendar Directly and Syncing with Selena

---

## SUMMARY

This plan finalizes the `/v2/book` success journey by:
1. Replacing the two-step reveal with an instant calendar embed on form success
2. Passing user data (name, email) to the calendar iframe via URL parameters
3. Keeping the "Get in Touch" and "What to Expect" sections visible
4. Updating the header to "You're Almost There! Select a Time Below."
5. Triggering a Selena confirmation message when the calendar state loads

---

## ARCHITECTURE OVERVIEW

```text
┌─────────────────────────────────────────────────────────────┐
│                     V2Book Page                              │
├─────────────────────────┬───────────────────────────────────┤
│  Contact Info Column    │   Form / Calendar Column          │
│  ├─ Get in Touch        │   ├─ [isSuccess === false]        │
│  ├─ Phone, Email        │   │   └─ ConsultationIntakeForm   │
│  └─ What to Expect      │   └─ [isSuccess === true]         │
│                         │       ├─ Success Header           │
│  (ALWAYS VISIBLE)       │       └─ GHLCalendarEmbed         │
│                         │           └─ iframe with params   │
└─────────────────────────┴───────────────────────────────────┘
```

---

## TASK 1: Create GHLCalendarEmbed Component with Data Pass-Through

### File: `src/components/v2/GHLCalendarEmbed.tsx` (NEW)

A dedicated component that:
- Accepts `name` and `email` props
- Constructs the calendar URL with query parameters
- Handles responsive sizing

```typescript
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GHLCalendarEmbedProps {
  name?: string;
  email?: string;
  phone?: string;
  className?: string;
}

const GHLCalendarEmbed = ({ name, email, phone, className = "" }: GHLCalendarEmbedProps) => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load the GoHighLevel form embed script
    const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Build calendar URL with pre-filled data
  const baseUrl = "https://api.leadconnectorhq.com/widget/booking/CY3PNu8yhtEuNMWH5e1x";
  const params = new URLSearchParams();
  
  if (name) params.append("name", name);
  if (email) params.append("email", email);
  if (phone) params.append("phone", phone);
  
  const calendarUrl = params.toString() 
    ? `${baseUrl}?${params.toString()}` 
    : baseUrl;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        src={calendarUrl}
        style={{ 
          width: "100%", 
          height: "700px",
          minHeight: "650px",
          border: "none", 
          borderRadius: "8px",
        }}
        id="ghl-calendar-embed"
        title={t("Schedule a Consultation", "Agendar una Consulta")}
      />
    </div>
  );
};

export default GHLCalendarEmbed;
```

---

## TASK 2: Refactor ConsultationIntakeForm Success State

### File: `src/components/v2/ConsultationIntakeForm.tsx`

Remove the intermediate "Want to schedule right now?" button and immediately show the calendar with the new header.

#### Key Changes:

1. **Store submitted name in state** (already storing email)
2. **Remove `showCalendar` state** - calendar shows immediately on success
3. **Update header** to "You're Almost There!"
4. **Pass name and email to calendar** via the new component
5. **Dispatch Selena proactive message** on success

```typescript
// New state for submitted name
const [submittedName, setSubmittedName] = useState("");

// In onSubmit, after success:
setSubmittedName(data.name);
setSubmittedEmail(data.email);
setIsSuccess(true);

// Dispatch Selena confirmation message
window.dispatchEvent(new CustomEvent('selena-proactive-message', {
  detail: { 
    message: language === 'es' 
      ? `¡Excelente trabajo, ${data.name.split(' ')[0]}! He enviado tus datos a Kasandra. Por favor selecciona un horario en el calendario que te funcione.`
      : `Great job, ${data.name.split(' ')[0]}! I've sent your details to Kasandra. Please pick a time that works for you on the calendar provided.`
  }
}));
```

#### Simplified Success State:

```typescript
if (isSuccess) {
  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6">
      {/* Confirmation Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
          {t("You're Almost There!", "¡Ya Casi Está!")}
        </h3>
        <p className="text-cc-charcoal text-base">
          {t(
            "Select a time below to complete your booking.",
            "Seleccione un horario abajo para completar su reservación."
          )}
        </p>
        <p className="text-sm text-cc-slate mt-1">
          {t(
            `Confirmation sent to ${submittedEmail}`,
            `Confirmación enviada a ${submittedEmail}`
          )}
        </p>
      </div>

      {/* Calendar Embed - Immediate */}
      <GHLCalendarEmbed 
        name={submittedName}
        email={submittedEmail}
      />
    </div>
  );
}
```

---

## TASK 3: Add Selena Booking Confirmation Event Listener

### File: `src/contexts/SelenaChatContext.tsx`

Add a new custom event listener for booking confirmation messages that doesn't use the default loss aversion suggested replies:

```typescript
// Listen for booking confirmation events
useEffect(() => {
  const handleBookingConfirmation = (event: Event) => {
    const customEvent = event as CustomEvent<{ message: string }>;
    const confirmMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: customEvent.detail.message,
      timestamp: new Date().toISOString(),
      suggestedReplies: [
        t("What happens after I book?", "¿Qué pasa después de reservar?"),
        t("Can I reschedule if needed?", "¿Puedo reprogramar si es necesario?"),
        t("Thanks, Selena!", "¡Gracias, Selena!"),
      ],
    };
    setMessages(prev => {
      const updated = [...prev, confirmMsg];
      saveHistory(updated);
      return updated;
    });
    logEvent('selena_booking_confirmation', { route: location.pathname });
  };
  
  window.addEventListener('selena-booking-confirmation', handleBookingConfirmation);
  return () => window.removeEventListener('selena-booking-confirmation', handleBookingConfirmation);
}, [t, location.pathname]);
```

#### Update Form to Use New Event

In `ConsultationIntakeForm.tsx`, dispatch to the new event:

```typescript
window.dispatchEvent(new CustomEvent('selena-booking-confirmation', {
  detail: { 
    message: language === 'es' 
      ? `¡Excelente trabajo, ${data.name.split(' ')[0]}! He enviado tus datos a Kasandra. Por favor selecciona un horario en el calendario.`
      : `Great job, ${data.name.split(' ')[0]}! I've sent your details to Kasandra. Please pick a time that works for you on the calendar.`
  }
}));
```

---

## TASK 4: Cleanup - Remove Unused GHLCalendarWidget

### File: `src/components/v2/ConsultationIntakeForm.tsx`

Remove the inline `GHLCalendarWidget` component (lines 124-151) since we're replacing it with the new `GHLCalendarEmbed` component.

Also remove the `showCalendar` state as it's no longer needed.

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `src/components/v2/GHLCalendarEmbed.tsx` | CREATE | New calendar embed with data pass-through |
| `src/components/v2/ConsultationIntakeForm.tsx` | MODIFY | Simplify success state, remove showCalendar, add proactive message |
| `src/contexts/SelenaChatContext.tsx` | MODIFY | Add `selena-booking-confirmation` event listener |
| `src/lib/analytics/logEvent.ts` | MODIFY | Add `selena_booking_confirmation` event type |

---

## DATA FLOW

```text
1. User fills ConsultationIntakeForm
2. onSubmit → Edge function → success
3. Store submittedName, submittedEmail in state
4. Dispatch 'selena-booking-confirmation' event
5. isSuccess = true → Render GHLCalendarEmbed
6. GHLCalendarEmbed builds URL: 
   ?name=John%20Doe&email=john@email.com
7. Calendar iframe loads with pre-filled data
8. Selena chat shows confirmation message (if open)
```

---

## UI CONTINUITY

The left column ("Get in Touch" + "What to Expect") remains unchanged in V2Book.tsx. Only the right column content changes from form → calendar.

### Before Success:
- Left: Contact info + What to Expect
- Right: ConsultationIntakeForm

### After Success:
- Left: Contact info + What to Expect (unchanged)
- Right: Success header + GHLCalendarEmbed

---

## VERIFICATION TESTS

### Test 1: Form Submission & Calendar Load
1. Navigate to `/v2/book`
2. Fill out the native consultation form
3. Submit successfully
4. **Verify**: Green checkmark + "You're Almost There!" header appears immediately
5. **Verify**: Calendar iframe loads below the confirmation
6. **Verify**: "Get in Touch" and "What to Expect" sections remain visible on the left

### Test 2: Data Pre-Fill
1. Submit form with Name: "John Doe", Email: "john@example.com"
2. **Verify**: Calendar iframe URL includes `?name=John%20Doe&email=john@example.com`
3. **Verify**: Inside the GHL calendar, user should NOT need to re-enter name/email

### Test 3: Selena Confirmation
1. Open Selena Chat drawer
2. Submit the consultation form
3. **Verify**: Selena chat shows: "Great job, [First Name]! I've sent your details to Kasandra. Please pick a time that works for you on the calendar."
4. **Verify**: Suggested replies: "What happens after I book?", "Can I reschedule if needed?", "Thanks, Selena!"

### Test 4: Mobile Responsiveness
1. Open `/v2/book` on mobile (375px width)
2. Submit the form
3. **Verify**: Calendar iframe is responsive and fills the container width
4. **Verify**: No horizontal scroll on the page

---

## SUCCESS CRITERIA

1. Form submission instantly shows calendar (no intermediate button)
2. Calendar URL includes user's name and email as query parameters
3. Left column (contact info, what to expect) remains visible
4. Header changes to "You're Almost There! Select a Time Below."
5. Selena shows personalized confirmation message with first name
6. Mobile experience is smooth with no layout breaks
