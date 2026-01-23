import { cn } from "@/lib/utils";
import { CheckCircle, Sparkles, ArrowRight, Play, Users, TrendingUp } from "lucide-react";
import type { BadgeType } from "@/lib/guides/personalization";

interface GuideCardBadgeProps {
  badgeType: BadgeType;
  className?: string;
}

const badgeConfig: Record<BadgeType, {
  label: string;
  labelEs: string;
  icon: typeof Sparkles;
  className: string;
}> = {
  recommended: {
    label: "Recommended",
    labelEs: "Recomendado",
    icon: Sparkles,
    className: "bg-cc-gold/20 text-cc-gold border-cc-gold/30",
  },
  next_best_step: {
    label: "Next Best Step",
    labelEs: "Siguiente Paso",
    icon: ArrowRight,
    className: "bg-cc-navy/10 text-cc-navy border-cc-navy/20",
  },
  start_here: {
    label: "Start Here",
    labelEs: "Comienza Aquí",
    icon: Play,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  continue: {
    label: "Continue",
    labelEs: "Continuar",
    icon: Play,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  popular_buyers: {
    label: "Popular with Buyers",
    labelEs: "Popular entre Compradores",
    icon: Users,
    className: "bg-cc-gold/10 text-cc-gold border-cc-gold/20",
  },
  popular_sellers: {
    label: "Popular with Sellers",
    labelEs: "Popular entre Vendedores",
    icon: TrendingUp,
    className: "bg-cc-gold/10 text-cc-gold border-cc-gold/20",
  },
  read: {
    label: "Read",
    labelEs: "Leído",
    icon: CheckCircle,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

export function GuideCardBadge({ badgeType, className }: GuideCardBadgeProps) {
  const config = badgeConfig[badgeType];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

// Export badge config for use in other components
export { badgeConfig };
