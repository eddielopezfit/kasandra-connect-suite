import { Zap, CircleDollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ComparisonData } from '@/data/guides/types';

interface Props {
  data: ComparisonData;
}

const GuideComparisonCards = ({ data }: Props) => {
  const { t } = useLanguage();

  const sides = [
    { side: data.left, icon: <Zap className="w-5 h-5 text-cc-gold" />, accent: 'bg-cc-gold/10' },
    { side: data.right, icon: <CircleDollarSign className="w-5 h-5 text-cc-navy" />, accent: 'bg-cc-navy/10' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {sides.map(({ side, icon, accent }) => (
          <div
            key={side.label}
            className="rounded-2xl border border-border bg-card p-6 hover:border-cc-gold/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${accent}`}>
                {icon}
              </div>
              <h3 className="font-serif font-bold text-cc-navy text-lg">
                {t(side.label, side.labelEs)}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-foreground/80">
              {side.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-cc-navy shrink-0">•</span>
                  <span>
                    <strong>{t(item.bold, item.boldEs)}</strong>{' '}
                    {t(item.text, item.textEs)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideComparisonCards;
