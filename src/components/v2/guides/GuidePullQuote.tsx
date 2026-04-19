import { useLanguage } from "@/contexts/LanguageContext";
import kasandraHeadshot from "@/assets/kasandra-headshot.webp";

interface GuidePullQuoteProps {
  quote?: string;
  quoteEs?: string;
  className?: string;
}

const GuidePullQuote = ({ quote, quoteEs, className = "" }: GuidePullQuoteProps) => {
  const { t } = useLanguage();

  if (!quote && !quoteEs) return null;

  const displayQuote = t(quote || "", quoteEs || "");
  if (!displayQuote) return null;

  return (
    <div className={`my-10 max-w-3xl mx-auto ${className}`}>
      <blockquote className="flex items-start gap-4 rounded-xl bg-cc-sand/50 p-6 border-l-4 border-cc-gold">
        <img
          src={kasandraHeadshot}
          alt="Kasandra Prieto"
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="w-14 h-14 rounded-full object-cover flex-shrink-0 mt-1"
        />
        <div>
          <p className="text-lg text-cc-charcoal italic leading-relaxed">
            "{displayQuote}"
          </p>
          <p className="mt-3 text-sm font-medium text-cc-navy">
            — Kasandra Prieto
          </p>
        </div>
      </blockquote>
    </div>
  );
};

export default GuidePullQuote;
