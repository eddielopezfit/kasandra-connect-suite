import { useLanguage } from "@/contexts/LanguageContext";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

const TrustBar = () => {
  const { t } = useLanguage();
  const { data } = useGoogleReviews();
  const reviewCount = data?.reviews?.length ?? 126;

  const platforms = ["Google", "Realtor.com", "Zillow"];

  return (
    <section className="bg-cc-navy py-2.5 px-6">
      <div className="flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap text-sm scrollbar-hide">
        {/* Rating cluster */}
        <div className="flex items-center gap-2">
          <span className="text-cc-gold tracking-wide">★★★★★</span>
          <span className="font-bold text-cc-ivory">4.9</span>
          <span className="text-cc-ivory/70">· 126+ {t("reviews", "reseñas")}</span>
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-cc-ivory/20 flex-shrink-0" />

        {/* Verified platforms cluster */}
        <div className="flex items-center gap-2">
          <span className="text-cc-gold/80 text-xs uppercase tracking-wider font-medium">
            {t("Verified", "Verificado")}
          </span>
          {platforms.map((p) => (
            <span
              key={p}
              className="bg-white/10 text-cc-ivory rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-cc-ivory/20 flex-shrink-0" />

        {/* Location cluster */}
        <div className="flex items-center gap-1.5">
          <span className="text-cc-ivory/70">
            {t("Bilingual Service", "Servicio Bilingüe")}
          </span>
          <span className="text-cc-ivory/50">· Tucson, AZ</span>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
