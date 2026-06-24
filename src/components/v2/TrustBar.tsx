import { useLanguage } from "@/contexts/LanguageContext";

const TrustBar = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-cc-navy py-3 px-6 border-y border-cc-gold/10">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[13px] md:text-sm">
        <span className="text-cc-ivory/85">
          {t(
            "Highly reviewed across public platforms",
            "Altamente calificada en plataformas públicas"
          )}
        </span>
        <span className="w-px h-4 bg-cc-ivory/20 hidden sm:block" />
        <span className="text-cc-ivory/85">
          {t("Bilingual REALTOR®", "REALTOR® Bilingüe")}
        </span>
        <span className="w-px h-4 bg-cc-ivory/20 hidden sm:block" />
        <span className="text-cc-gold/90 font-medium">
          Corner Connect · Realty Executives Arizona Territory
        </span>
      </div>
    </section>
  );
};

export default TrustBar;
