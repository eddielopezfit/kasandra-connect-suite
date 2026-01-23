import { useLanguage } from "@/contexts/LanguageContext";

const SocialProofTicker = () => {
  const { t } = useLanguage();

  const logos = [
    { name: "Coldwell Banker", text: "COLDWELL BANKER" },
    { name: "Tucson Appliance", text: "TUCSON APPLIANCE" },
    { name: "Arizona Diaper Bank", text: "ARIZONA DIAPER BANK" },
    { name: "Tucson Hispanic Chamber", text: t("TUCSON HISPANIC CHAMBER", "CÁMARA HISPANA DE TUCSON") },
  ];

  return (
    <section className="py-12 bg-muted border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
          {t("As Seen In / Trusted By", "Visto En / Confiado Por")}
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-scroll">
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-12 flex items-center justify-center"
            >
              <span className="text-xl md:text-2xl font-serif font-semibold text-muted-foreground/50 whitespace-nowrap tracking-wider">
                {logo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofTicker;
