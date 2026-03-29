import { useLanguage } from "@/contexts/LanguageContext";
import singingKaraoke from "@/assets/kasandra/singing-karaoke.jpg";
import dancingStars from "@/assets/kasandra/dancing-stars-2024.jpg";
import desertSunset from "@/assets/kasandra/desert-sunset-cowboy.jpg";
import navyDressIronGate from "@/assets/kasandra/navy-dress-iron-gate.jpg";
import constructionClass from "@/assets/kasandra/construction-class.jpg";
import missLilly from "@/assets/kasandra/miss-lilly-gold-balloons.jpg";

interface GalleryItem {
  src: string;
  altEn: string;
  altEs: string;
  captionEn: string;
  captionEs: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: singingKaraoke,
    altEn: "Kasandra singing karaoke",
    altEs: "Kasandra cantando karaoke",
    captionEn: "Sunday Karaoke Night",
    captionEs: "Noche de Karaoke Dominical",
  },
  {
    src: dancingStars,
    altEn: "Kasandra at Dancing with Our Stars fundraiser",
    altEs: "Kasandra en el evento Bailando con Nuestras Estrellas",
    captionEn: "Dancing for Diapers — 2024",
    captionEs: "Bailando por los Pañales — 2024",
  },
  {
    src: desertSunset,
    altEn: "Kasandra at a Tucson desert sunset",
    altEs: "Kasandra en un atardecer del desierto de Tucson",
    captionEn: "My Tucson",
    captionEs: "Mi Tucson",
  },
  {
    src: navyDressIronGate,
    altEn: "Kasandra Prieto at a Tucson iron gate",
    altEs: "Kasandra Prieto en una puerta de hierro en Tucson",
    captionEn: "The Real Me",
    captionEs: "La Verdadera Yo",
  },
  {
    src: constructionClass,
    altEn: "Kasandra building tiny homes at construction course",
    altEs: "Kasandra construyendo casas pequeñas en curso de construcción",
    captionEn: "15 Tiny Homes Built",
    captionEs: "15 Casas Pequeñas Construidas",
  },
  {
    src: missLilly,
    altEn: "Miss Lilly celebrating with gold balloons",
    altEs: "Miss Lilly celebrando con globos dorados",
    captionEn: "Miss Lilly 🐾",
    captionEs: "Miss Lilly 🐾",
  },
];

interface KasandraPhotoGalleryProps {
  className?: string;
}

const KasandraPhotoGallery = ({ className = '' }: KasandraPhotoGalleryProps) => {
  const { t } = useLanguage();

  return (
    <section className={`py-16 md:py-20 bg-cc-ivory ${className}`}>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("The Real Kasandra", "La Verdadera Kasandra")}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
            {t("Beyond the Business Card", "Más Allá de la Tarjeta de Presentación")}
          </h2>
          <p className="text-cc-charcoal/60 mt-3 max-w-xl mx-auto text-sm">
            {t(
              "Singer, dancer, builder, community leader — and yes, your REALTOR®.",
              "Cantante, bailarina, constructora, líder comunitaria — y sí, tu REALTOR®."
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden shadow-soft border border-cc-sand-dark/20 aspect-[4/3]"
            >
              <img
                src={item.src}
                alt={t(item.altEn, item.altEs)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Hover caption overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cc-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-semibold">
                  {t(item.captionEn, item.captionEs)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KasandraPhotoGallery;
