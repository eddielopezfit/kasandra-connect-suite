import { useLanguage } from "@/contexts/LanguageContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GuideVideoProps {
  src?: string;
  posterSrc?: string;
  alt: string;
  altEs: string;
  className?: string;
}

const GuideVideo = ({ src, posterSrc, alt, altEs, className = "" }: GuideVideoProps) => {
  if (!src) return null;

  const { t } = useLanguage();

  return (
    <div className={`my-10 max-w-3xl mx-auto ${className}`}>
      <AspectRatio ratio={16 / 9}>
        <video
          src={src}
          poster={posterSrc}
          controls
          preload="none"
          aria-label={t(alt, altEs)}
          className="w-full h-full rounded-xl shadow-sm object-cover"
        />
      </AspectRatio>
    </div>
  );
};

export default GuideVideo;
