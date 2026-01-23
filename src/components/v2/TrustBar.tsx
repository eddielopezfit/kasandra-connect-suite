import { useLanguage } from "@/contexts/LanguageContext";

const TrustBar = () => {
  const { t } = useLanguage();

  const trustEntities = [
    {
      name: "Arizona Diaper Bank",
      role: t("Vice Chair, Governing Board", "Vicepresidenta, Junta Directiva"),
    },
    {
      name: "Greater Tucson Leadership",
      role: t("Class of 2026", "Promoción 2026"),
    },
    {
      name: "Urbana 92.5 FM",
      role: t("Radio Show Host", "Conductora de Radio"),
    },
    {
      name: "Tucson Appliance",
      role: t("Hispanic Community Spokeswoman", "Portavoz de la Comunidad Hispana"),
    },
    {
      name: "Rumbo al Éxito",
      role: t("Vice President", "Vicepresidenta"),
    },
    {
      name: "Tucson Real Producers",
      role: t("Top 200 Realtors, Rising Star", "Top 200 Realtors, Estrella en Ascenso"),
    },
  ];

  // Double the items for seamless loop
  const duplicatedEntities = [...trustEntities, ...trustEntities];

  return (
    <section className="py-10 bg-white border-y border-border/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
          {t("Trusted by & Actively Involved With", "De Confianza y Activamente Involucrada Con")}
        </p>
      </div>
      
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
        
        {/* Scrolling container */}
        <div className="flex animate-marquee">
          {duplicatedEntities.map((entity, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-8 md:px-12 flex items-center group"
              title={`${entity.name} — ${entity.role}`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-sm md:text-base font-serif font-semibold text-cc-charcoal/80 whitespace-nowrap group-hover:text-cc-navy transition-colors">
                  {entity.name}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground/60 whitespace-nowrap mt-0.5">
                  {entity.role}
                </span>
              </div>
              {/* Soft separator */}
              {index < duplicatedEntities.length - 1 && (
                <span className="ml-8 md:ml-12 text-cc-slate/20">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
