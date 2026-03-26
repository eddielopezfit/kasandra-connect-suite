/**
 * DynamicStatsGrid — Stats grid that can display both static and dynamic values.
 * When a stat has a `dynamicKey`, it pulls from useProgramData instead of using the static value.
 * Falls back to static value if dynamic data isn't available.
 */

import { CheckCircle2 } from 'lucide-react';
import { useProgramData, type DynamicGuideData } from '@/hooks/useProgramData';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatItem {
  value: string;
  valueEs: string;
  label: string;
  labelEs: string;
  /** If set, overrides value/valueEs with live data from useProgramData */
  dynamicKey?: keyof DynamicGuideData;
}

interface DynamicStatsGridProps {
  data: StatItem[];
}

export function DynamicStatsGrid({ data }: DynamicStatsGridProps) {
  const programData = useProgramData();
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((stat, i) => {
            // If dynamicKey is set and has a value, use it
            let displayValue = isEs ? stat.valueEs : stat.value;
            if (stat.dynamicKey && programData[stat.dynamicKey] != null) {
              displayValue = String(programData[stat.dynamicKey]);
            }

            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 hover:border-cc-gold/40 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-cc-gold mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-cc-navy text-lg">
                    {displayValue}
                  </span>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isEs ? stat.labelEs : stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
