/**
 * Concierge Tab Panels - Content panels for each tab
 * Slide-up panels with intent-specific actions
 * Uses global language prop for consistent UI chrome
 */

import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Home, 
  ShoppingBag, 
  Compass,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConciergeTab, JourneyIntent } from './ConciergeTabBar';
import { ChatAction } from '@/contexts/SelenaChatContext';
import { logEvent, EventType } from '@/lib/analytics/logEvent';

interface ConciergeTabPanelsProps {
  activeTab: ConciergeTab | null;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onActionClick: (action: ChatAction) => void;
  language: 'en' | 'es';
  leadId?: string | null;
  closeDrawer: () => void;
  currentIntent?: JourneyIntent;
}

export function ConciergeTabPanels({
  activeTab,
  onClose,
  onSendMessage,
  onActionClick,
  language,
  leadId,
  closeDrawer,
  currentIntent,
}: ConciergeTabPanelsProps) {
  const navigate = useNavigate();
  const t = (en: string, es: string) => language === 'es' ? es : en;

  if (!activeTab) return null;

  const handleNavigate = (path: string, eventType?: EventType) => {
    if (eventType) {
      logEvent(eventType, { path, route: window.location.pathname });
    }
    closeDrawer();
    navigate(path);
  };

  const handleIntentMessage = (message: string) => {
    logEvent('concierge_intent_click', { message, tab: activeTab });
    onSendMessage(message);
    onClose();
  };

  const handlePriorityCall = () => {
    logEvent('priority_call_click', { source: 'concierge_tabs' });
    onActionClick({
      label: t('Schedule a Call', 'Agendar una Llamada'),
      type: 'priority_call',
      eventType: 'priority_call_click',
    });
    onClose();
  };

  return (
    <div 
      className={cn(
        "absolute bottom-full left-0 right-0 mb-0",
        "bg-background border-t border-border rounded-t-xl shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-200",
        "max-h-[50vh] overflow-y-auto"
      )}
    >
      {/* Close handle */}
      <div className="flex justify-center py-2 border-b border-border/50">
        <button 
          onClick={onClose}
          className="w-10 h-1 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
          aria-label={t('Close panel', 'Cerrar panel')}
        />
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'start' && (
          <StartHerePanel 
            t={t} 
            onIntentMessage={handleIntentMessage}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'guides' && (
          <GuidesPanel 
            t={t} 
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'options' && (
          <MyOptionsPanel 
            t={t} 
            leadId={leadId}
            onActionClick={onActionClick}
            onClose={onClose}
            onSendMessage={onSendMessage}
            onNavigate={handleNavigate}
            currentIntent={currentIntent}
          />
        )}

        {activeTab === 'talk' && (
          <TalkToKasandraPanel 
            t={t} 
            onPriorityCall={handlePriorityCall}
          />
        )}
      </div>
    </div>
  );
}

// === START HERE PANEL ===
function StartHerePanel({ 
  t, 
  onIntentMessage,
  onNavigate
}: { 
  t: (en: string, es: string) => string;
  onIntentMessage: (msg: string) => void;
  onNavigate: (path: string, eventType?: EventType) => void;
}) {
  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Let's find your starting point", "Encontremos tu punto de partida")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Tell me what brings you here today.", "Cuéntame qué te trae hoy.")}
        </p>
      </div>

      <div className="space-y-2">
        <IntentButton
          icon={Home}
          onClick={() => onIntentMessage(t("I'm thinking about selling", "Estoy pensando en vender"))}
          label={t("I'm thinking about selling", "Estoy pensando en vender")}
        />
        <IntentButton
          icon={ShoppingBag}
          onClick={() => onIntentMessage(t("I'm looking to buy", "Estoy buscando comprar"))}
          label={t("I'm looking to buy", "Estoy buscando comprar")}
        />
        <IntentButton
          icon={Compass}
          onClick={() => onIntentMessage(t("Just exploring for now", "Solo estoy explorando"))}
          label={t("Just exploring for now", "Solo estoy explorando")}
          variant="outline"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-2">
          {t("Quick reads:", "Lecturas rápidas:")}
        </p>
        <div className="flex flex-wrap gap-2">
          <QuickLink 
            label={t("First-Time Buyer Guide", "Guía del Comprador Primerizo")}
            onClick={() => onNavigate('/v2/guides/first-time-buyer-guide', 'guide_cta_click')}
          />
          <QuickLink 
            label={t("Selling Your Home", "Vender Su Casa")}
            onClick={() => onNavigate('/v2/guides/selling-for-top-dollar', 'guide_cta_click')}
          />
        </div>
      </div>
    </>
  );
}

// === GUIDES PANEL ===
function GuidesPanel({ 
  t, 
  onNavigate 
}: { 
  t: (en: string, es: string) => string;
  onNavigate: (path: string, eventType?: EventType) => void;
}) {
  const featuredGuides = [
    { id: 'first-time-buyer-guide', labelEn: 'First-Time Buyers', labelEs: 'Compradores Primerizos' },
    { id: 'selling-for-top-dollar', labelEn: 'Selling Your Home', labelEs: 'Vender Su Casa' },
    { id: 'cash-offer-guide', labelEn: 'Cash Offers', labelEs: 'Ofertas en Efectivo' },
  ];

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Explore Our Guides", "Explora Nuestras Guías")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Clear information, no pressure.", "Información clara, sin presión.")}
        </p>
      </div>

      <Button
        onClick={() => onNavigate('/v2/guides', 'guide_browse_click')}
        className="w-full mb-4"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        {t("Browse All Guides", "Ver Todas las Guías")}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("Featured:", "Destacados:")}
        </p>
        <div className="flex flex-wrap gap-2">
          {featuredGuides.map((guide) => (
            <QuickLink
              key={guide.id}
              label={t(guide.labelEn, guide.labelEs)}
              onClick={() => onNavigate(`/v2/guides/${guide.id}`, 'guide_cta_click')}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// === MY OPTIONS PANEL ===
// Routes cards to Decision Rooms and chat triggers based on user intent
function MyOptionsPanel({ 
  t,
  leadId,
  onActionClick,
  onClose,
  onSendMessage,
  onNavigate,
  currentIntent,
}: { 
  t: (en: string, es: string) => string;
  leadId?: string | null;
  onActionClick: (action: ChatAction) => void;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onNavigate: (path: string, eventType?: EventType) => void;
  currentIntent?: JourneyIntent;
}) {
  const handleViewLastReport = () => {
    logEvent('report_view_click', { source: 'concierge_tabs' });
    onActionClick({
      label: t('View My Report', 'Ver Mi Reporte'),
      type: 'open_report',
      eventType: 'report_view_click',
    });
    onClose();
  };

  // Valuation card → Trigger Selena chat to ask for property address
  const handleValuationClick = () => {
    logEvent('concierge_valuation_click', { source: 'my_options', intent: currentIntent });
    onSendMessage(t(
      "I'd like to know what I might walk away with if I sell.",
      "Me gustaría saber cuánto podría recibir si vendo."
    ));
  };

  // Cash vs Listing → Navigate to Decision Room
  const handleCashComparisonClick = () => {
    logEvent('concierge_cash_comparison_click', { source: 'my_options', intent: currentIntent });
    onNavigate('/v2/cash-offer-options', 'decision_room_visit');
  };

  // Buyer Readiness → Navigate to Readiness Check
  const handleBuyerReadinessClick = () => {
    logEvent('concierge_buyer_readiness_click', { source: 'my_options', intent: currentIntent });
    onNavigate('/v2/buyer-readiness', 'decision_room_visit');
  };

  // Intent-based filtering and ordering
  const isBuyer = currentIntent === 'buy';
  const isSeller = currentIntent === 'sell' || currentIntent === 'cash';

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Get Clarity on Your Options", "Claridad Sobre Tus Opciones")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Personalized insights, no obligation.", "Información personalizada, sin compromiso.")}
        </p>
      </div>

      {leadId && (
        <Button
          variant="outline"
          onClick={handleViewLastReport}
          className="w-full mb-4 border-cc-gold text-cc-gold hover:bg-cc-gold/10"
        >
          <FileText className="w-4 h-4 mr-2" />
          {t("View My Latest Report", "Ver Mi Último Reporte")}
        </Button>
      )}

      <div className="space-y-2">
        {/* Buyer-first ordering: Readiness → Valuation → Cash Comparison */}
        {isBuyer && (
          <>
            <OptionCard
              onClick={handleBuyerReadinessClick}
              label={t("Buyer Readiness Check", "Verificación de Preparación")}
              description={t("See where you stand", "Ve en qué punto estás")}
            />
            <OptionCard
              onClick={handleValuationClick}
              label={t("See what I might walk away with", "Ver lo que podría recibir")}
              description={t("Selling your current home?", "¿Vendiendo tu casa actual?")}
            />
            <OptionCard
              onClick={handleCashComparisonClick}
              label={t("Cash vs Listing Comparison", "Comparación: Efectivo vs Listado")}
              description={t("Compare your options", "Compara tus opciones")}
            />
          </>
        )}

        {/* Seller-first ordering: Valuation → Cash Comparison (hide Buyer Readiness) */}
        {isSeller && (
          <>
            <OptionCard
              onClick={handleValuationClick}
              label={t("See what I might walk away with", "Ver lo que podría recibir")}
              description={t("Quick home value preview", "Vista previa rápida del valor")}
            />
            <OptionCard
              onClick={handleCashComparisonClick}
              label={t("Cash vs Listing Comparison", "Comparación: Efectivo vs Listado")}
              description={t("Compare your options", "Compara tus opciones")}
            />
          </>
        )}

        {/* Default ordering (exploring/unknown): All cards, valuation first */}
        {!isBuyer && !isSeller && (
          <>
            <OptionCard
              onClick={handleValuationClick}
              label={t("See what I might walk away with", "Ver lo que podría recibir")}
              description={t("Quick home value preview", "Vista previa rápida del valor")}
            />
            <OptionCard
              onClick={handleCashComparisonClick}
              label={t("Cash vs Listing Comparison", "Comparación: Efectivo vs Listado")}
              description={t("Compare your options", "Compara tus opciones")}
            />
            <OptionCard
              onClick={handleBuyerReadinessClick}
              label={t("Buyer Readiness Check", "Verificación de Preparación")}
              description={t("See where you stand", "Ve en qué punto estás")}
            />
          </>
        )}
      </div>
    </>
  );
}

// === TALK TO KASANDRA PANEL ===
// IMPORTANT: Never claim to check schedules. Always route to self-service scheduling.
function TalkToKasandraPanel({ 
  t, 
  onPriorityCall 
}: { 
  t: (en: string, es: string) => string;
  onPriorityCall: () => void;
}) {
  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Ready to Connect?", "¿Lista para Conectar?")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Book time with Kasandra when you're ready.", "Agenda tiempo con Kasandra cuando estés lista.")}
        </p>
      </div>

      <div className="space-y-3">
        {/* Primary CTA - Schedule a Call */}
        <Button
          onClick={onPriorityCall}
          className="w-full bg-cc-navy hover:bg-cc-navy/90"
          size="lg"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t("Schedule a Call", "Agendar una Llamada")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        {/* Secondary CTA - 10-Min Priority Call */}
        <Button
          variant="outline"
          onClick={onPriorityCall}
          className="w-full"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("10-Min Priority Call", "Llamada Prioritaria de 10 Min")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        {t(
          "Kasandra personally handles every consultation.",
          "Kasandra maneja personalmente cada consulta."
        )}
      </p>
    </>
  );
}

// === HELPER COMPONENTS ===

function IntentButton({ 
  icon: Icon, 
  onClick, 
  label, 
  variant = 'default' 
}: { 
  icon: typeof Home;
  onClick: () => void;
  label: string;
  variant?: 'default' | 'outline';
}) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={cn(
        "w-full justify-start gap-3 h-auto py-3",
        variant === 'default' && "bg-primary/10 hover:bg-primary/20 text-foreground"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full",
        "bg-muted hover:bg-muted/80",
        "text-foreground font-medium",
        "transition-colors duration-200"
      )}
    >
      {label}
    </button>
  );
}

function OptionCard({ 
  onClick, 
  label, 
  description 
}: { 
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg",
        "bg-muted/50 hover:bg-muted",
        "border border-border/50 hover:border-border",
        "transition-all duration-200",
        "group"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}
