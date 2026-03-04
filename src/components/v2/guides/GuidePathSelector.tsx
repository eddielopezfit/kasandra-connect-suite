import { useState } from 'react';
import { Zap, TrendingUp, UserCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PathOption } from '@/data/guides/types';

interface Props {
  data: PathOption[];
}

const PATH_ICONS: Record<string, React.ReactNode> = {
  A: <Zap className="w-5 h-5 text-cc-gold" />,
  B: <TrendingUp className="w-5 h-5 text-cc-navy" />,
  C: <UserCheck className="w-5 h-5 text-cc-navy-light" />,
};

const GuidePathSelector = ({ data }: Props) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-3">
        {data.map((path) => {
          const isActive = activeId === path.id;
          return (
            <button
              key={path.id}
              onClick={() => setActiveId(path.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                isActive
                  ? 'border-cc-gold bg-cc-gold/10 scale-[1.01]'
                  : 'border-border bg-card hover:border-cc-gold/30'
              }`}
            >
              <div className="mt-1 shrink-0">
                {PATH_ICONS[path.id] ?? <Zap className="w-5 h-5 text-cc-gold" />}
              </div>
              <div>
                <h4 className="font-serif font-bold text-cc-navy">
                  {t(path.title, path.titleEs)}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(path.desc, path.descEs)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GuidePathSelector;
