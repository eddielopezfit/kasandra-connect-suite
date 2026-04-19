import { useLanguage } from "@/contexts/LanguageContext";
import kasandraHeadshot from "@/assets/kasandra-headshot.webp";
import { motion } from "framer-motion";

interface KasandraPresenceCardProps {
  messageEn: string;
  messageEs: string;
  /** Optional override image (lifestyle photo, etc.) */
  imageSrc?: string;
  /** Compact for inline guide use, full for section breaks */
  variant?: 'default' | 'compact' | 'editorial';
  className?: string;
}

/**
 * KasandraPresenceCard — Personal presence injection at decision points.
 * Shows Kasandra's headshot + contextual message. Calm, trust-building.
 */
const KasandraPresenceCard = ({
  messageEn,
  messageEs,
  imageSrc,
  variant = 'default',
  className = '',
}: KasandraPresenceCardProps) => {
  const { t } = useLanguage();
  const image = imageSrc || kasandraHeadshot;

  if (variant === 'compact') {
    return (
      <div className={`my-8 max-w-2xl mx-auto ${className}`}>
        <div className="flex items-start gap-4 rounded-xl bg-cc-sand/40 p-5 border border-cc-sand-dark/20">
          <img
            src={image}
            alt="Kasandra Prieto"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div>
            <p className="text-sm text-cc-charcoal leading-relaxed">
              {t(messageEn, messageEs)}
            </p>
            <p className="mt-2 text-xs font-medium text-cc-navy/60">
              — Kasandra Prieto, REALTOR®
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'editorial') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className={`py-16 bg-cc-sand/30 ${className}`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <img
              src={image}
              alt="Kasandra Prieto"
              width={144}
              height={144}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-lg flex-shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div>
              <blockquote className="text-lg md:text-xl text-cc-charcoal italic leading-relaxed font-serif">
                "{t(messageEn, messageEs)}"
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-cc-navy">
                Kasandra Prieto
              </p>
              <p className="text-xs text-cc-charcoal/50">
                {t("REALTOR® · Corner Connect", "REALTOR® · Corner Connect")}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5 }}
      className={`my-12 max-w-3xl mx-auto ${className}`}
    >
      <div className="flex items-start gap-5 rounded-2xl bg-gradient-to-br from-cc-sand/60 to-cc-ivory/80 p-6 border border-cc-sand-dark/20 shadow-sm">
        <img
          src={image}
          alt="Kasandra Prieto"
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-cc-gold/20"
          loading="lazy"
          decoding="async"
        />
        <div>
          <p className="text-base text-cc-charcoal leading-relaxed">
            {t(messageEn, messageEs)}
          </p>
          <p className="mt-3 text-sm font-semibold text-cc-navy">
            — Kasandra Prieto
          </p>
          <p className="text-xs text-cc-charcoal/50">
            {t("REALTOR® · Corner Connect", "REALTOR® · Corner Connect")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default KasandraPresenceCard;
