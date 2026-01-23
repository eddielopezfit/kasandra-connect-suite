/**
 * Concierge Tab Bar - Bottom navigation for Selena chat
 * Mobile-first tab bar for quick intent routing
 * Uses uiLanguage prop for consistent UI chrome language
 */

import { Compass, BookOpen, LayoutList, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConciergeTab = 'start' | 'guides' | 'options' | 'talk';

interface ConciergeTabBarProps {
  activeTab: ConciergeTab | null;
  onTabChange: (tab: ConciergeTab) => void;
  language: 'en' | 'es';
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

export function ConciergeTabBar({ activeTab, onTabChange, language }: ConciergeTabBarProps) {
  return (
    <div className="flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm px-1 py-1.5 shrink-0">
      {TABS.map((tab) => {
        const config = TAB_CONFIG[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;
        const label = language === 'es' ? config.labelEs : config.labelEn;

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
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-pressed={isActive}
            aria-label={label}
          >
            <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
            <span className="truncate max-w-[70px]">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
