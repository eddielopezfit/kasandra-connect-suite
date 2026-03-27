import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";

interface KasandraVideoBlockProps {
  /** YouTube or Vimeo embed URL */
  videoUrl?: string;
  /** Fallback thumbnail when no video */
  thumbnailUrl?: string;
  /** Contextual label shown above the video */
  labelEn?: string;
  labelEs?: string;
  /** Compact variant for inline guide/section use */
  variant?: 'default' | 'compact' | 'cinematic';
  className?: string;
}

/**
 * KasandraVideoBlock — Video presence component.
 * Supports YouTube/Vimeo embed, fallback thumbnail, play overlay, and modal playback.
 * Lazy loads iframe only on interaction.
 */
const KasandraVideoBlock = ({
  videoUrl,
  thumbnailUrl,
  labelEn,
  labelEs,
  variant = 'default',
  className = '',
}: KasandraVideoBlockProps) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const thumbnail = thumbnailUrl || kasandraHeadshot;
  const label = labelEn ? t(labelEn, labelEs || labelEn) : null;

  const handlePlay = () => {
    if (!videoUrl) return;
    if (variant === 'compact') {
      setIsPlaying(true);
    } else {
      setModalOpen(true);
    }
  };

  const isYouTube = videoUrl?.includes('youtube') || videoUrl?.includes('youtu.be');
  const isVimeo = videoUrl?.includes('vimeo');
  const embedUrl = videoUrl
    ? isYouTube
      ? videoUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0'
      : isVimeo
      ? videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/') + '?autoplay=1'
      : videoUrl
    : '';

  if (variant === 'compact') {
    return (
      <div className={`my-8 max-w-2xl mx-auto ${className}`}>
        {label && (
          <p className="text-xs font-semibold uppercase tracking-widest text-cc-gold mb-3">
            {label}
          </p>
        )}
        <div className="relative rounded-xl overflow-hidden shadow-sm bg-cc-navy/5 aspect-video">
          {isPlaying && videoUrl ? (
            <iframe
              src={embedUrl}
              title="Kasandra Prieto"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          ) : (
            <>
              <img
                src={thumbnail}
                alt="Kasandra Prieto"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {videoUrl && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center bg-cc-navy/30 hover:bg-cc-navy/40 transition-colors group"
                  aria-label={t("Play video", "Reproducir video")}
                >
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-cc-navy ml-0.5" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'cinematic') {
    return (
      <>
        <div className={`relative ${className}`}>
          {label && (
            <p className="text-xs font-semibold uppercase tracking-widest text-cc-gold/80 mb-4 text-center">
              {label}
            </p>
          )}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video max-w-4xl mx-auto">
            <img
              src={thumbnail}
              alt="Kasandra Prieto"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {videoUrl && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-cc-navy/50 via-transparent to-transparent hover:from-cc-navy/60 transition-colors group"
                aria-label={t("Play video", "Reproducir video")}
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-cc-navy ml-1" />
                </div>
              </button>
            )}
          </div>
        </div>
        <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} embedUrl={embedUrl} />
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className={`my-12 max-w-3xl mx-auto ${className}`}>
        {label && (
          <p className="text-xs font-semibold uppercase tracking-widest text-cc-gold mb-4">
            {label}
          </p>
        )}
        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-cc-navy/5">
          <img
            src={thumbnail}
            alt="Kasandra Prieto"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {videoUrl && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-cc-navy/20 hover:bg-cc-navy/30 transition-colors group"
              aria-label={t("Play video", "Reproducir video")}
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-cc-navy ml-0.5" />
              </div>
            </button>
          )}
        </div>
      </div>
      <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} embedUrl={embedUrl} />
    </>
  );
};

function VideoModal({ open, onClose, embedUrl }: { open: boolean; onClose: () => void; embedUrl: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={embedUrl}
              title="Kasandra Prieto"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default KasandraVideoBlock;
