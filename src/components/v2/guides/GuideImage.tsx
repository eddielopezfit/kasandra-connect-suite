import { useLanguage } from "@/contexts/LanguageContext";

interface GuideImageProps {
  src?: string;
  alt: string;
  altEs: string;
  className?: string;
}

const GuideImage = ({ src, alt, altEs, className = "" }: GuideImageProps) => {
  if (!src) return null;

  const { t } = useLanguage();

  return (
    <div className={`my-10 max-w-3xl mx-auto ${className}`}>
      <img
        src={src}
        alt={t(alt, altEs)}
        loading="lazy"
        className="w-full rounded-xl shadow-sm"
      />
    </div>
  );
};

export default GuideImage;
