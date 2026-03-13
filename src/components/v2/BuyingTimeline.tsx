import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
  {
    titleEn: "Get Pre-Approved",
    titleEs: "Obtén tu Preaprobación",
    descEn: "Know your budget before you fall in love with a home",
    descEs: "Conoce tu presupuesto antes de enamorarte de una casa",
  },
  {
    titleEn: "Find Your Home",
    titleEs: "Encuentra tu Hogar",
    descEn: "Selena helps you explore neighborhoods 24/7 before you meet Kasandra",
    descEs: "Selena te ayuda a explorar vecindarios 24/7 antes de conocer a Kasandra",
  },
  {
    titleEn: "Make Your Offer",
    titleEs: "Haz tu Oferta",
    descEn: "Kasandra negotiates hard so you don't leave money on the table",
    descEs: "Kasandra negocia fuerte para que no pierdas dinero",
  },
  {
    titleEn: "Get Your Keys",
    titleEs: "Llaves en Mano",
    descEn: "Close with confidence — bilingual support through every signature",
    descEs: "Cierra con confianza — apoyo bilingüe en cada firma",
  },
];

const BuyingTimeline = () => {
  const { t } = useLanguage();
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    itemsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-cc-ivory">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            {t("The Buying Process", "El Proceso de Compra")}
          </h2>
          <p className="text-white/80 mt-3 max-w-2xl mx-auto">
            {t(
              "A clear, step-by-step approach to help you feel confident every step of the way.",
              "Un enfoque claro, paso a paso, para ayudarle a sentirse seguro en cada etapa."
            )}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Gold vertical connector line */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-cc-gold md:-translate-x-px" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  ref={(el) => { itemsRef.current[index] = el; }}
                  className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Mobile layout: always left-aligned */}
                  <div className="flex items-start gap-4 md:hidden">
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-cc-gold flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    {/* Content */}
                    <div className="pt-1">
                      <h3 className="font-serif text-lg font-bold text-cc-navy">
                        {t(step.titleEn, step.titleEs)}
                      </h3>
                      <p className="text-sm text-cc-charcoal mt-1">
                        {t(step.descEn, step.descEs)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop layout: alternating */}
                  <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6 items-center">
                    {/* Left content */}
                    <div className={`text-right ${isEven ? "" : "order-3 text-left"}`}>
                      {isEven && (
                        <>
                          <h3 className="font-serif text-xl font-bold text-cc-navy">
                            {t(step.titleEn, step.titleEs)}
                          </h3>
                          <p className="text-sm text-cc-charcoal mt-1">
                            {t(step.descEn, step.descEs)}
                          </p>
                        </>
                      )}
                      {!isEven && (
                        <>
                          <h3 className="font-serif text-xl font-bold text-cc-navy">
                            {t(step.titleEn, step.titleEs)}
                          </h3>
                          <p className="text-sm text-cc-charcoal mt-1">
                            {t(step.descEn, step.descEs)}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Center node */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-cc-gold flex items-center justify-center shadow-md order-2">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>

                    {/* Empty spacer for the opposite side */}
                    <div className={isEven ? "order-3" : "order-1"} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyingTimeline;
