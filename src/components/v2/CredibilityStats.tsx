import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";

interface StatConfig {
  value: number;
  suffix: string;
  labelEn: string;
  labelEs: string;
}

function useCountUp(target: number, active: boolean, duration = 1300) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return current;
}

function AnimatedStat({ stat, active }: { stat: StatConfig; active: boolean }) {
  const { t } = useLanguage();
  const count = useCountUp(stat.value, active);

  return (
    <div className="text-center py-4">
      <p className="text-3xl md:text-4xl font-bold text-cc-gold font-serif tabular-nums">
        {active ? count.toLocaleString() : "0"}
        <span className="text-cc-gold/80">{stat.suffix}</span>
      </p>
      <p className="text-sm text-cc-navy/70 mt-1 font-medium">
        {t(stat.labelEn, stat.labelEs)}
      </p>
    </div>
  );
}

const CredibilityStats = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats: StatConfig[] = [
    { value: 6000, suffix: "+", labelEn: "Pima County Transactions", labelEs: "Transacciones en el Condado Pima" },
    { value: reviewCount, suffix: "+", labelEn: "Five-Star Reviews", labelEs: "Reseñas de Cinco Estrellas" },
    { value: 20, suffix: "+", labelEn: "Years in Tucson", labelEs: "Años en Tucson" },
    { value: 2, suffix: "", labelEn: "Languages · EN / ES", labelEs: "Idiomas · EN / ES" },
  ];

  return (
    <section
      ref={ref}
      data-section="credibility-stats"
      className="bg-cc-ivory py-8 md:py-10 border-y border-cc-sand-dark/20"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 items-stretch">
          {stats.map((stat) => (
            <AnimatedStat key={stat.labelEn} stat={stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CredibilityStats;
