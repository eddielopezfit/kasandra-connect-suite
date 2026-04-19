import { cn } from "@/lib/utils";

interface KasandraPortraitProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
};
const sizeDimensions = {
  sm: { w: 128, h: 171 },
  md: { w: 192, h: 256 },
  lg: { w: 256, h: 341 },
};

const KasandraPortrait = ({ src, alt, size = "md", className }: KasandraPortraitProps) => {
  const { w, h } = sizeDimensions[size];
  return (
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className={cn(
        "aspect-[3/4] object-cover object-top rounded-xl shadow-soft border border-cc-sand-dark/20",
        sizeClasses[size],
        className
      )}
    />
  );
};

export default KasandraPortrait;
