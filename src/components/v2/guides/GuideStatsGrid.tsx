import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StatItem } from '@/data/guides/types';

interface Props {
  data: StatItem[];
}

const GuideStatsGrid = ({ data }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((stat, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 hover:border-cc-gold/40 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-cc-gold mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-cc-navy text-lg">
                  {t(stat.value, stat.valueEs)}
                </span>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(stat.label, stat.labelEs)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideStatsGrid;
