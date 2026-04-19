import { useLanguage } from "@/contexts/LanguageContext";

interface GuideImageProps {
  src?: string;
  alt: string;
  altEs: string;
  className?: string;
}

const GuideImage = ({ src, alt, altEs, className = "" }: GuideImageProps) => {
  const { t } = useLanguage();

  if (!src) return null;

  return (
    <div className={`my-10 max-w-3xl mx-auto ${className}`}>
      <img
        src={src}
        alt={t(alt, altEs)}
        width={1024}
        height={576}
        loading="lazy"
        decoding="async"
        className="w-full h-auto rounded-xl shadow-sm"
      />
    </div>
  );
};

export default GuideImage;
