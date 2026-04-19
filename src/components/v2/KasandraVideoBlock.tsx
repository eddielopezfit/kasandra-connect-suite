import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import kasandraHeadshot from "@/assets/kasandra-headshot.webp";

type Platform = 'youtube' | 'vimeo' | 'instagram' | 'tiktok' | 'unknown';

interface KasandraVideoBlockProps {
  /** YouTube, Vimeo, Instagram Reel, or TikTok URL */
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

/* ── Platform detection ── */
function detectPlatform(url?: string): Platform {
  if (!url) return 'unknown';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo')) return 'vimeo';
  return 'unknown';
}

/* ── Embed URL builders ── */
function buildEmbedUrl(url: string, platform: Platform): string {
  switch (platform) {
    case 'instagram': {
      // e.g. https://www.instagram.com/reel/DH2hf1Tum9T/ → /reel/DH2hf1Tum9T/embed/
      const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
      if (match) return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
      return url;
    }
    case 'tiktok': {
      // e.g. https://www.tiktok.com/@kasandraprieto/video/7552733410532412703
      const match = url.match(/video\/(\d+)/);
      if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
      return url;
    }
    case 'youtube': {
      return url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0';
    }
    case 'vimeo': {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/') + '?autoplay=1';
    }
    default:
      return url;
  }
}

/* ── Whether the platform uses vertical (9:16) aspect ratio ── */
function isVerticalPlatform(platform: Platform): boolean {
  return platform === 'instagram' || platform === 'tiktok';
}

/* ── Whether the platform auto-embeds (no play button needed) ── */
function isDirectEmbed(platform: Platform): boolean {
  return platform === 'instagram' || platform === 'tiktok';
}

/**
 * KasandraVideoBlock — Video presence component.
 * Supports YouTube/Vimeo embed with play overlay + modal,
 * and Instagram Reel / TikTok direct iframe embeds (mobile-optimized).
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

  const platform = detectPlatform(videoUrl);
  const thumbnail = thumbnailUrl || kasandraHeadshot;
  const label = labelEn ? t(labelEn, labelEs || labelEn) : null;
  const vertical = isVerticalPlatform(platform);
  const directEmbed = isDirectEmbed(platform);
  const embedUrl = videoUrl ? buildEmbedUrl(videoUrl, platform) : '';

  const handlePlay = () => {
    if (!videoUrl) return;
    if (variant === 'compact') {
      setIsPlaying(true);
    } else {
      setModalOpen(true);
    }
  };

  /* ── Social embed (IG / TikTok) — always inline, tight frame ── */
  if (directEmbed && videoUrl) {
    return (
      <SocialEmbedBlock
        embedUrl={embedUrl}
        platform={platform}
        label={label}
        vertical={vertical}
        className={className}
        variant={variant}
      />
    );
  }

  /* ── Compact variant (YouTube/Vimeo) ── */
  if (variant === 'compact') {
    return (
      <div className={`my-8 max-w-2xl mx-auto ${className}`}>
        {label && <EmbedLabel text={label} />}
        <div className="relative rounded-xl overflow-hidden shadow-sm bg-cc-navy/5 aspect-video">
          {isPlaying && videoUrl ? (
            <EmbedIframe src={embedUrl} />
          ) : (
            <ThumbnailWithPlay thumbnail={thumbnail} onPlay={handlePlay} hasVideo={!!videoUrl} />
          )}
        </div>
      </div>
    );
  }

  /* ── Cinematic variant (YouTube/Vimeo) ── */
  if (variant === 'cinematic') {
    return (
      <>
        <div className={`relative ${className}`}>
          {label && <EmbedLabel text={label} centered />}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video max-w-4xl mx-auto">
            <img src={thumbnail} alt="Kasandra Prieto" width={640} height={360} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            {videoUrl && (
              <PlayOverlay onPlay={handlePlay} size="lg" gradient />
            )}
          </div>
        </div>
        <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} embedUrl={embedUrl} />
      </>
    );
  }

  /* ── Default variant (YouTube/Vimeo) ── */
  return (
    <>
      <div className={`my-12 max-w-3xl mx-auto ${className}`}>
        {label && <EmbedLabel text={label} />}
        <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-cc-navy/5">
          <img src={thumbnail} alt="Kasandra Prieto" width={640} height={360} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          {videoUrl && <PlayOverlay onPlay={handlePlay} />}
        </div>
      </div>
      <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} embedUrl={embedUrl} />
    </>
  );
};

/* ═══════════════════════════════════════════════
   Sub-components — kept in same file for cohesion
   ═══════════════════════════════════════════════ */

/** Social embed block for Instagram Reels & TikTok */
function SocialEmbedBlock({
  embedUrl, platform, label, vertical, className, variant,
}: {
  embedUrl: string; platform: Platform; label: string | null;
  vertical: boolean; className: string; variant: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const maxW = variant === 'compact' ? 'max-w-sm' : 'max-w-md';
  const aspectClass = vertical ? 'aspect-[9/16]' : 'aspect-video';

  return (
    <div className={`my-8 mx-auto ${maxW} ${className}`}>
      {label && <EmbedLabel text={label} centered />}
      <div className={`relative rounded-xl overflow-hidden shadow-md bg-cc-navy/5 ${aspectClass}`}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cc-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={`Kasandra Prieto — ${platform}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          style={{ border: 'none' }}
        />
      </div>
      <p className="text-[11px] text-cc-charcoal/40 text-center mt-2 capitalize">
        {platform === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
      </p>
    </div>
  );
}

/** Reusable label badge */
function EmbedLabel({ text, centered }: { text: string; centered?: boolean }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-widest text-cc-gold mb-3 ${centered ? 'text-center' : ''}`}>
      {text}
    </p>
  );
}

/** Thumbnail with optional play button overlay */
function ThumbnailWithPlay({ thumbnail, onPlay, hasVideo }: {
  thumbnail: string; onPlay: () => void; hasVideo: boolean;
}) {
  const { t } = useLanguage();
  return (
    <>
      <img src={thumbnail} alt="Kasandra Prieto" width={640} height={360} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      {hasVideo && (
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-cc-navy/30 hover:bg-cc-navy/40 transition-colors group"
          aria-label={t("Play video", "Reproducir video")}
        >
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-cc-navy ml-0.5" />
          </div>
        </button>
      )}
    </>
  );
}

/** Play overlay for cinematic/default variants */
function PlayOverlay({ onPlay, size, gradient }: { onPlay: () => void; size?: 'lg'; gradient?: boolean }) {
  const { t } = useLanguage();
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';
  const icon = size === 'lg' ? 'w-8 h-8' : 'w-7 h-7';
  const bg = gradient
    ? 'bg-gradient-to-t from-cc-navy/50 via-transparent to-transparent hover:from-cc-navy/60'
    : 'bg-cc-navy/20 hover:bg-cc-navy/30';
  return (
    <button
      onClick={onPlay}
      className={`absolute inset-0 flex items-center justify-center ${bg} transition-colors group`}
      aria-label={t("Play video", "Reproducir video")}
    >
      <div className={`${dim} rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
        <Play className={`${icon} text-cc-navy ml-0.5`} />
      </div>
    </button>
  );
}

/** Iframe helper */
function EmbedIframe({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      title="Kasandra Prieto"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 w-full h-full"
      loading="lazy"
    />
  );
}

/** Modal for YouTube/Vimeo playback */
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
            <EmbedIframe src={embedUrl} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default KasandraVideoBlock;
