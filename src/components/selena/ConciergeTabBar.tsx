/**
 * Concierge Tab Bar - Bottom navigation for Selena chat
 * Mobile-first tab bar for quick intent routing
 * Uses uiLanguage prop for consistent UI chrome language
 * Now supports journey-aware "Start Here" tab labels
 */

import { Compass, BookOpen, LayoutList, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConciergeTab = 'start' | 'guides' | 'options' | 'talk';
export type JourneyIntent = 'sell' | 'buy' | 'cash' | 'exploring';

interface ConciergeTabBarProps {
  activeTab: ConciergeTab | null;
  onTabChange: (tab: ConciergeTab) => void;
  language: 'en' | 'es';
  // New props for journey awareness
  currentIntent?: JourneyIntent;
  journeyStep?: number; // 1, 2, 3, 4
}

const TAB_CONFIG: Record<ConciergeTab, {
  labelEn: string;
  labelEs: string;
  icon: typeof Compass;
}> = {
  start: {
    labelEn: 'Start Here',
    labelEs: 'Comienza',
    icon: Compass,
  },
  guides: {
    labelEn: 'Guides',
    labelEs: 'Guías',
    icon: BookOpen,
  },
  options: {
    labelEn: 'My Options',
    labelEs: 'Opciones',
    icon: LayoutList,
  },
  talk: {
    labelEn: 'Talk',
    labelEs: 'Hablar',
    icon: Phone,
  },
};

const TABS: ConciergeTab[] = ['start', 'guides', 'options', 'talk'];

// Journey step labels for the "Start Here" tab
const STEP_LABELS: Record<string, { en: string; es: string }[]> = {
  sell: [
    { en: 'Step 1: Value', es: 'Paso 1: Valor' },
    { en: 'Step 2: Analysis', es: 'Paso 2: Análisis' },
    { en: 'Step 3: Decision', es: 'Paso 3: Decisión' },
    { en: 'Step 4: Action', es: 'Paso 4: Acción' },
  ],
  buy: [
    { en: 'Step 1: Ready', es: 'Paso 1: Listo' },
    { en: 'Step 2: Explore', es: 'Paso 2: Explorar' },
    { en: 'Step 3: Tour', es: 'Paso 3: Recorrer' },
    { en: 'Step 4: Offer', es: 'Paso 4: Oferta' },
  ],
  cash: [
    { en: 'Step 1: Estimate', es: 'Paso 1: Estimar' },
    { en: 'Step 2: Compare', es: 'Paso 2: Comparar' },
    { en: 'Step 3: Review', es: 'Paso 3: Revisar' },
    { en: 'Step 4: Close', es: 'Paso 4: Cerrar' },
  ],
};

function getTabLabel(
  tab: ConciergeTab, 
  language: 'en' | 'es', 
  intent?: JourneyIntent, 
  step?: number
): string {
  // Show journey progress on 'start' tab for users with declared intent
  if (tab === 'start' && intent && intent !== 'exploring' && step && step > 0) {
    const steps = STEP_LABELS[intent];
    if (steps && step <= steps.length) {
      return steps[step - 1][language];
    }
  }
  
  // Default labels
  const config = TAB_CONFIG[tab];
  return language === 'es' ? config.labelEs : config.labelEn;
}

export function ConciergeTabBar({ 
  activeTab, 
  onTabChange, 
  language,
  currentIntent,
  journeyStep 
}: ConciergeTabBarProps) {
  return (
    <div className="flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm px-1 py-1.5 shrink-0">
      {TABS.map((tab) => {
        const config = TAB_CONFIG[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;
        const label = getTabLabel(tab, language, currentIntent, journeyStep);
        const hasProgress = tab === 'start' && currentIntent && currentIntent !== 'exploring' && journeyStep && journeyStep > 0;

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg",
              "text-xs font-medium transition-all duration-200",
              "min-w-[60px]",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              // Highlight the start tab when showing journey progress
              hasProgress && !isActive && "text-primary/70"
            )}
            aria-pressed={isActive}
            aria-label={label}
          >
            <Icon className={cn("w-4 h-4", (isActive || hasProgress) && "text-primary")} />
            <span className="truncate max-w-[70px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
