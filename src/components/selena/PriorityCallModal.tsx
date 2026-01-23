import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Phone, Video, MessageCircle, Calendar, Sparkles, Clock, ChevronDown, ChevronUp, ArrowLeft, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { logEvent } from "@/lib/analytics/logEvent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TimeSlot {
  start: string;
  end: string;
  booking_url: string;
  display_time: string;
}

type Channel = 'zoom' | 'call';
type Step = 'channel' | 'slots';

interface PriorityCallModalProps {
  open: boolean;
  onClose: () => void;
  bookingUrl: string;
  slots?: TimeSlot[];
  onRequestCallback?: (channel: Channel, contactPref?: 'call' | 'text') => void;
  onChannelSelect?: (channel: Channel) => Promise<{ bookingUrl: string; slots: TimeSlot[] }>;
}

export function PriorityCallModal({ 
  open, 
  onClose, 
  bookingUrl: initialBookingUrl, 
  slots: initialSlots = [],
  onRequestCallback,
  onChannelSelect,
}: PriorityCallModalProps) {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('channel');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [currentSlots, setCurrentSlots] = useState<TimeSlot[]>(initialSlots);
  const [currentBookingUrl, setCurrentBookingUrl] = useState(initialBookingUrl);
  
  const hasSlots = currentSlots.length > 0;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('channel');
      setSelectedChannel(null);
      setShowAllSlots(false);
      setCurrentSlots(initialSlots);
      setCurrentBookingUrl(initialBookingUrl);
      logEvent('handoff_offer_shown', { 
        booking_url: initialBookingUrl,
        slots_available: initialSlots.length,
      });
    }
  }, [open, initialBookingUrl, initialSlots]);

  const handleChannelSelect = async (channel: Channel) => {
    logEvent('handoff_channel_select', { channel });
    setSelectedChannel(channel);
    
    if (onChannelSelect) {
      setIsLoadingSlots(true);
      try {
        const result = await onChannelSelect(channel);
        setCurrentSlots(result.slots);
        setCurrentBookingUrl(result.bookingUrl);
      } catch (error) {
        console.error('[PriorityCallModal] Error fetching slots:', error);
        logEvent('handoff_notify_error', { channel, error: 'Failed to fetch slots' });
      } finally {
        setIsLoadingSlots(false);
      }
    }
    
    setStep('slots');
  };

  const handleBookClick = () => {
    logEvent('handoff_booking_click', { 
      booking_url: currentBookingUrl,
      channel: selectedChannel,
    });
    logEvent('handoff_booking_opened', { channel: selectedChannel });
    
    // Navigate internally or open external URL
    if (currentBookingUrl.startsWith('/')) {
      navigate(currentBookingUrl);
    } else {
      window.open(currentBookingUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    logEvent('handoff_slot_select', { 
      slot_time: slot.start,
      display_time: slot.display_time,
      channel: selectedChannel,
    });
    if (slot.booking_url.startsWith('/')) {
      navigate(slot.booking_url);
    } else {
      window.open(slot.booking_url, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleRequestCallback = () => {
    logEvent('handoff_request_callback', { channel: selectedChannel });
    onRequestCallback?.(selectedChannel || 'call', 'call');
    onClose();
  };

  const handleTextMeInstead = () => {
    logEvent('handoff_text_request', { channel: selectedChannel });
    onRequestCallback?.(selectedChannel || 'call', 'text');
    onClose();
  };

  const handleKeepChatting = () => {
    logEvent('handoff_keep_chatting', {});
    onClose();
  };

  const handleBack = () => {
    setStep('channel');
    setSelectedChannel(null);
    setShowAllSlots(false);
  };

  // Step 1: Channel Selection
  const channelContent = (
    <div className="flex flex-col items-center text-center p-6 space-y-5">
      {/* Premium badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          {language === 'es' ? 'Acceso Prioritario' : 'Priority Access'}
        </span>
      </div>

      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
        <Calendar className="w-8 h-8 text-primary-foreground" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground">
        {language === 'es' 
          ? '¿Cómo quieres conectar?' 
          : 'How Would You Like to Connect?'}
      </h2>

      {/* Premium framing - calm, reassuring, zero-pressure */}
      <p className="text-muted-foreground leading-relaxed max-w-sm">
        {language === 'es'
          ? 'Basándome en lo que compartiste, una breve llamada puede ayudarte a ver tus opciones con claridad.'
          : 'Based on what you shared, a brief call can help you see your options clearly.'}
      </p>

      {/* Channel buttons - consistent labels */}
      <div className="flex flex-col w-full gap-3 pt-2">
        <Button
          size="lg"
          onClick={() => handleChannelSelect('zoom')}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md h-14"
        >
          <Video className="w-5 h-5 mr-3" />
          {language === 'es' ? 'Llamada Zoom de 10 Minutos' : '10-Minute Priority Zoom'}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => handleChannelSelect('call')}
          className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold h-14"
        >
          <Phone className="w-5 h-5 mr-3" />
          {language === 'es' ? '10 Minutos por Teléfono' : '10-Minute Priority Call'}
        </Button>

        {/* Keep chatting option */}
        <Button
          variant="ghost"
          size="lg"
          onClick={handleKeepChatting}
          className="w-full text-muted-foreground hover:text-foreground mt-2"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          {language === 'es' ? 'Seguir Chateando con Selena' : 'Keep Chatting With Selena'}
        </Button>
      </div>

      {/* Subtle reassurance */}
      <p className="text-xs text-muted-foreground/70 max-w-xs">
        {language === 'es'
          ? 'Selena es un asistente de IA. Todas las decisiones son manejadas por Kasandra Prieto, Realtor® licenciada.'
          : 'Selena is an AI assistant. All decisions are handled by Kasandra Prieto, licensed Realtor®.'}
      </p>
    </div>
  );

  // Step 2: Slot Selection
  const slotsContent = (
    <div className="flex flex-col items-center text-center p-6 space-y-5 max-h-[80vh] overflow-y-auto">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'es' ? 'Atrás' : 'Back'}
      </button>

      {/* Channel badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
        {selectedChannel === 'zoom' ? (
          <Video className="w-4 h-4 text-primary" />
        ) : (
          <Phone className="w-4 h-4 text-primary" />
        )}
        <span className="text-sm font-medium text-primary">
          {selectedChannel === 'zoom' 
            ? (language === 'es' ? 'Zoom de 10 Min' : '10-Min Zoom')
            : (language === 'es' ? 'Llamada Telefónica' : 'Phone Call')
          }
        </span>
      </div>

      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
        <Calendar className="w-8 h-8 text-primary-foreground" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground">
        {language === 'es' 
          ? 'Elige un Horario' 
          : 'Pick a Time'}
      </h2>

      {/* Loading state */}
      {isLoadingSlots ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">
            {language === 'es' ? 'Buscando horarios...' : 'Finding times...'}
          </p>
        </div>
      ) : hasSlots ? (
        /* Slots Available */
        <div className="flex flex-col w-full gap-3 pt-2">
          {/* Primary CTA - First Slot */}
          <Button
            size="lg"
            onClick={handleBookClick}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
          >
            <Calendar className="w-5 h-5 mr-2" />
            {language === 'es' 
              ? `Reservar a las ${currentSlots[0]?.display_time || ''}` 
              : `Book at ${currentSlots[0]?.display_time || ''}`}
          </Button>

          {/* Show More Slots Toggle */}
          {currentSlots.length > 1 && (
            <div className="w-full">
              <button
                onClick={() => setShowAllSlots(!showAllSlots)}
                className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Clock className="w-4 h-4" />
                <span>
                  {language === 'es' 
                    ? (showAllSlots ? 'Ocultar horarios' : 'Ver otros horarios')
                    : (showAllSlots ? 'Hide times' : 'Pick another time')}
                </span>
                {showAllSlots ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Slot Grid */}
              {showAllSlots && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {currentSlots.slice(1).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium",
                        "bg-cc-sand text-cc-navy border border-cc-navy/20",
                        "hover:bg-cc-navy hover:text-white",
                        "transition-colors duration-200"
                      )}
                    >
                      {slot.display_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text me instead option */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleTextMeInstead}
            className="w-full border-muted-foreground/30"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Envíenme un Texto' : 'Text Me Instead'}
          </Button>

          {/* Keep Chatting */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleKeepChatting}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Seguir Chateando con Selena' : 'Keep Chatting With Selena'}
          </Button>
        </div>
      ) : (
        /* Fallback - No Slots Available - calm, reassuring */
        <div className="flex flex-col w-full gap-3 pt-2">
          <div className="bg-cc-sand border border-cc-sand-dark rounded-lg p-4 mb-2">
            <p className="text-sm text-cc-charcoal">
              {language === 'es'
                ? 'No hay horarios disponibles ahora mismo. Kasandra puede contactarte cuando tenga disponibilidad.'
                : "No times available right now. Kasandra can reach out when she has availability."}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleRequestCallback}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
          >
            <Phone className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Solicitar que Me Llamen' : 'Request a Call Back'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleTextMeInstead}
            className="w-full border-muted-foreground/30"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Envíenme un Texto' : 'Text Me Instead'}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleKeepChatting}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Seguir Chateando con Selena' : 'Keep Chatting With Selena'}
          </Button>
        </div>
      )}

      {/* Subtle reassurance */}
      <p className="text-xs text-muted-foreground/70 max-w-xs">
        {language === 'es'
          ? 'Selena es un asistente de IA. Todas las decisiones son manejadas por Kasandra Prieto, Realtor® licenciada.'
          : 'Selena is an AI assistant. All decisions are handled by Kasandra Prieto, licensed Realtor®.'}
      </p>
    </div>
  );

  const content = step === 'channel' ? channelContent : slotsContent;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <div className="relative">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
