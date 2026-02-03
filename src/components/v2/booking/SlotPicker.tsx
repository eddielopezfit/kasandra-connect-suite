import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  start: string;
  end: string;
  booking_url: string;
  display_time: string;
}

interface SlotPickerProps {
  leadId: string;
  channel?: 'call' | 'zoom';
  onSlotSelected: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

/**
 * Native slot picker component that fetches real-time availability
 * from the check-availability edge function
 */
const SlotPicker = ({ leadId, channel = 'call', onSlotSelected, isLoading: externalLoading }: SlotPickerProps) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!leadId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('check-availability', {
          body: {
            lead_id: leadId,
            channel,
            preferred_window: 'today',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
        
        if (fnError) throw new Error(fnError.message);
        if (!data?.ok) throw new Error(data?.error || 'Failed to fetch slots');
        
        setSlots(data.slots || []);
      } catch (err) {
        console.error('[SlotPicker] Error:', err);
        setError(t(
          'Unable to load available times. Please try again.',
          'No se pudieron cargar los horarios disponibles. Por favor intente de nuevo.'
        ));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSlots();
  }, [leadId, channel, t]);
  
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSlotSelected(slot);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-8 h-8 text-cc-gold animate-spin" />
        <p className="text-cc-charcoal text-sm">
          {t('Loading available times...', 'Cargando horarios disponibles...')}
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-cc-gold text-cc-navy hover:bg-cc-gold/10"
        >
          {t('Try Again', 'Intentar de nuevo')}
        </Button>
      </div>
    );
  }
  
  if (slots.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-10 h-10 text-cc-slate mx-auto mb-3" />
        <p className="text-cc-charcoal">
          {t(
            'No slots available right now. Please check back later or call me directly.',
            'No hay horarios disponibles en este momento. Por favor revise más tarde o llámeme directamente.'
          )}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarCheck className="w-5 h-5 text-cc-gold" />
        <p className="text-cc-charcoal font-medium">
          {t('Select a time that works for you:', 'Seleccione un horario que le funcione:')}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((slot, idx) => (
          <Button
            key={idx}
            variant="outline"
            disabled={externalLoading}
            onClick={() => handleSlotClick(slot)}
            className={cn(
              "h-14 text-base font-medium transition-all",
              selectedSlot?.start === slot.start
                ? "bg-cc-gold text-cc-navy border-cc-gold ring-2 ring-cc-gold/30"
                : "border-cc-sand-dark hover:border-cc-gold hover:bg-cc-gold/5"
            )}
          >
            {externalLoading && selectedSlot?.start === slot.start ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {slot.display_time}
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-cc-slate text-center mt-2">
        {t('All times are in your local timezone', 'Todos los horarios están en su zona horaria local')}
      </p>
    </div>
  );
};

export default SlotPicker;
