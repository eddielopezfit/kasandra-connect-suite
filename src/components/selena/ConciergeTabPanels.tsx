/**
 * Concierge Tab Panels - Content panels for each tab
 * Slide-up panels with intent-specific actions
 * Uses global language prop for consistent UI chrome
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Home, 
  ShoppingBag, 
  Compass,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConciergeTab, JourneyIntent } from './ConciergeTabBar';
import { ChatAction } from '@/contexts/SelenaChatContext';
import { logEvent, EventType } from '@/lib/analytics/logEvent';
import { getLiveGuides } from '@/lib/guides/guideRegistry';
import { 
  getSessionContext, 
  setFieldIfEmpty, 
  type Intent,
} from '@/lib/analytics/selenaSession';

const CONTEXT_KEY = 'selena_context_v2';

/**
 * Truly delete intent + timeline keys from localStorage context,
 * reset progression to early state. Works even if localStorage is empty.
 */
function resetJourneyIntent(): void {
  const raw = localStorage.getItem(CONTEXT_KEY);
  let ctx: Record<string, unknown> = {};
  try { ctx = raw ? JSON.parse(raw) : {}; } catch { ctx = {}; }

  delete ctx.intent;
  delete ctx.timeline;
  if (ctx.intent === null) delete ctx.intent;
  if (ctx.timeline === null) delete ctx.timeline;

  ctx.chip_phase_floor = 1;
  ctx.current_mode = 1;

  localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx));
}

interface ConciergeTabPanelsProps {
  activeTab: ConciergeTab | null;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onActionClick: (action: ChatAction) => void;
  language: 'en' | 'es';
  leadId?: string | null;
  hasReports?: boolean; // Track if user has generated any reports
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
  hasReports,
  closeDrawer,
  currentIntent,
}: ConciergeTabPanelsProps) {
  const navigate = useNavigate();
  const t = (en: string, es: string) => language === 'es' ? es : en;

  // effectiveIntent is the single source of truth for all child panels
  const [effectiveIntent, setEffectiveIntent] = useState<Intent | undefined>(() => {
    return getSessionContext()?.intent as Intent | undefined;
  });

  useEffect(() => {
    setEffectiveIntent(getSessionContext()?.intent as Intent | undefined);
  }, [activeTab, currentIntent]);

  if (!activeTab) return null;

  const handleNavigate = (path: string, eventType?: EventType) => {
    if (eventType) {
      logEvent(eventType, { path, route: window.location.pathname });
    }
    // Navigate FIRST, then close drawer — prevents unmount before navigation completes
    navigate(path);
    closeDrawer();
  };

  const handleIntentMessage = (message: string) => {
    logEvent('concierge_intent_click', { message, tab: activeTab });
    onSendMessage(message);
    onClose();
  };

  const handleBookWithKasandra = () => {
    logEvent('priority_call_click', { source: 'concierge_tabs' });
    closeDrawer();
    navigate('/book');
  };

  const handleResetIntent = () => {
    resetJourneyIntent();
    setEffectiveIntent(undefined);
  };

  const handleInstantIntentSet = (canonicalIntent: Intent) => {
    setFieldIfEmpty('intent', canonicalIntent);
    // Re-read actual stored value (respects write-once guard)
    setEffectiveIntent(getSessionContext()?.intent as Intent | undefined);
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
            effectiveIntent={effectiveIntent}
            onResetIntent={handleResetIntent}
            onInstantIntentSet={handleInstantIntentSet}
          />
        )}

        {activeTab === 'guides' && (
          <GuidesPanel 
            t={t} 
            onNavigate={handleNavigate}
            effectiveIntent={effectiveIntent}
          />
        )}

        {activeTab === 'options' && (
          <MyOptionsPanel 
            t={t} 
            leadId={leadId}
            hasReports={hasReports}
            onActionClick={onActionClick}
            onClose={onClose}
            onSendMessage={onSendMessage}
            onNavigate={handleNavigate}
            effectiveIntent={effectiveIntent}
          />
        )}

        {activeTab === 'talk' && (
          <TalkToKasandraPanel 
            t={t} 
            onBookWithKasandra={handleBookWithKasandra}
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
  onNavigate,
  effectiveIntent,
  onResetIntent,
  onInstantIntentSet,
}: { 
  t: (en: string, es: string) => string;
  onIntentMessage: (msg: string) => void;
  onNavigate: (path: string, eventType?: EventType) => void;
  effectiveIntent?: Intent;
  onResetIntent: () => void;
  onInstantIntentSet: (intent: Intent) => void;
}) {
  const isIntentLocked = !!effectiveIntent && effectiveIntent !== 'explore';

  // Intent-specific next steps using exact CHIP_ACTION_MAP strings
  const intentNextSteps: Record<string, { en: string; es: string }[]> = {
    buy: [
      { en: "Take the readiness check", es: "Tomar la evaluación de preparación" },
      { en: "Browse guides", es: "Explorar guías" },
    ],
    sell: [
      { en: "Get my selling options", es: "Ver mis opciones de venta" },
      { en: "Compare cash vs. listing", es: "Comparar efectivo vs. listado" },
      { en: "Quick seller readiness check", es: "Check rápido de preparación para vender" },
    ],
    cash: [
      { en: "Compare cash vs. listing", es: "Comparar efectivo vs. listado" },
      { en: "Take the cash readiness check", es: "Tomar el check de preparación en efectivo" },
    ],
  };

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {isIntentLocked
            ? t("Your Next Steps", "Sus Próximos Pasos")
            : t("Let's find your starting point", "Encontremos su punto de partida")}
        </h3>
        {!isIntentLocked && (
          <p className="text-sm text-muted-foreground mt-1">
            {t("Tell me what brings you here today.", "Cuénteme qué le trae hoy.")}
          </p>
        )}
      </div>

      {isIntentLocked ? (
        <div className="space-y-2">
          {(isIntentLocked && effectiveIntent ? intentNextSteps[effectiveIntent] ?? [] : []).map((step) => (
            <OptionCard
              key={step.en}
              onClick={() => onIntentMessage(step.en)}
              label={t(step.en, step.es)}
              description=""
            />
          ))}
          {/* Change my goal — explicit reset */}
          <div className="text-center mt-3">
            <button
              onClick={onResetIntent}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              {t("Change my goal", "Cambiar mi objetivo")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <IntentButton
            icon={Home}
            onClick={() => {
              onInstantIntentSet('sell');
              onIntentMessage(t("I'm thinking about selling", "Estoy pensando en vender"));
            }}
            label={t("I'm thinking about selling", "Estoy pensando en vender")}
          />
          <IntentButton
            icon={ShoppingBag}
            onClick={() => {
              onInstantIntentSet('buy');
              onIntentMessage(t("I'm looking to buy", "Estoy buscando comprar"));
            }}
            label={t("I'm looking to buy", "Estoy buscando comprar")}
          />
          <IntentButton
            icon={Compass}
            onClick={() => {
              onInstantIntentSet('explore');
              onIntentMessage(t("Just exploring for now", "Solo estoy explorando"));
            }}
            label={t("Just exploring for now", "Solo estoy explorando")}
            variant="outline"
          />
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-2">
          {t("Quick reads:", "Lecturas rápidas:")}
        </p>
        <div className="flex flex-wrap gap-2">
          {(!isIntentLocked || effectiveIntent === 'buy') && (
            <QuickLink 
              label={t("First-Time Buyer Guide", "Guía del Comprador Primerizo")}
              onClick={() => onNavigate('/guides/first-time-buyer-guide', 'guide_cta_click')}
            />
          )}
          {(!isIntentLocked || effectiveIntent === 'sell' || effectiveIntent === 'cash') && (
            <QuickLink 
              label={t("Selling Your Home", "Vender Su Casa")}
              onClick={() => onNavigate('/guides/selling-for-top-dollar', 'guide_cta_click')}
            />
          )}
        </div>
      </div>
    </>
  );
}

// === GUIDES PANEL ===
function GuidesPanel({ 
  t, 
  onNavigate,
  effectiveIntent,
}: { 
  t: (en: string, es: string) => string;
  onNavigate: (path: string, eventType?: EventType) => void;
  effectiveIntent?: Intent;
}) {
  const BUYER_CATEGORIES = new Set(['buying', 'stories']);
  const BUYER_INTENTS = new Set(['buy', 'trust']);
  const SELLER_CATEGORIES = new Set(['selling', 'cash', 'valuation', 'probate', 'stories']);
  const SELLER_INTENTS = new Set(['sell', 'cash', 'value', 'life_event', 'trust']);

  const isIntentLocked = !!effectiveIntent && effectiveIntent !== 'explore';

  const featuredGuides = getLiveGuides()
    .filter(g => g.tier <= 2)
    .filter(g => {
      if (!isIntentLocked) return true;
      if (effectiveIntent === 'buy') {
        return BUYER_CATEGORIES.has(g.category) || BUYER_INTENTS.has(g.decisionIntent || '');
      }
      // sell or cash
      return SELLER_CATEGORIES.has(g.category) || SELLER_INTENTS.has(g.decisionIntent || '');
    })
    .map(g => ({ id: g.id, labelEn: g.labelEn, labelEs: g.labelEs }));

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
        onClick={() => onNavigate('/guides', 'guide_browse_click')}
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
              onClick={() => onNavigate(`/guides/${guide.id}`, 'guide_cta_click')}
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
  hasReports,
  onActionClick,
  onClose,
  onSendMessage,
  onNavigate,
  effectiveIntent,
}: { 
  t: (en: string, es: string) => string;
  leadId?: string | null;
  hasReports?: boolean;
  onActionClick: (action: ChatAction) => void;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onNavigate: (path: string, eventType?: EventType) => void;
  effectiveIntent?: Intent;
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
    logEvent('concierge_valuation_click', { source: 'my_options', intent: effectiveIntent });
    onSendMessage(t(
      "I'd like to know what I might walk away with if I sell.",
      "Me gustaría saber cuánto podría recibir si vendo."
    ));
  };

  // Cash vs Listing → Navigate to Decision Room
  const handleCashComparisonClick = () => {
    logEvent('concierge_cash_comparison_click', { source: 'my_options', intent: effectiveIntent });
    onNavigate('/cash-offer-options', 'decision_room_visit');
  };

  // Buyer Readiness → Navigate to Readiness Check
  const handleBuyerReadinessClick = () => {
    logEvent('concierge_buyer_readiness_click', { source: 'my_options', intent: effectiveIntent });
    onNavigate('/buyer-readiness', 'decision_room_visit');
  };

  // Intent-based filtering and ordering
  const isBuyer = effectiveIntent === 'buy';
  const isSeller = effectiveIntent === 'sell' || effectiveIntent === 'cash';

  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Get Clarity on Your Options", "Claridad Sobre Sus Opciones")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Personalized insights, no obligation.", "Información personalizada, sin compromiso.")}
        </p>
      </div>

      {/* Only show "View My Latest Report" if user has actually generated reports */}
      {leadId && hasReports && (
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
          <OptionCard
            onClick={handleBuyerReadinessClick}
            label={t("Buyer Readiness Check", "Verificación de Preparación")}
            description={t("See where you stand", "Vea en qué punto está")}
          />
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
  onBookWithKasandra 
}: { 
  t: (en: string, es: string) => string;
  onBookWithKasandra: () => void;
}) {
  return (
    <>
      <div className="text-center mb-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {t("Ready to Connect?", "¿Listo/a para Conectar?")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Book time with Kasandra when you're ready.", "Agenda tiempo con Kasandra cuando esté listo/a.")}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onBookWithKasandra}
          className="w-full bg-cc-navy hover:bg-cc-navy/90"
          size="lg"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t("Connect with Kasandra", "Conectarse con Kasandra")}
          <ArrowRight className="w-4 h-4 ml-2" />
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
