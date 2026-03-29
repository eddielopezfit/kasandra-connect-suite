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

const KasandraPortrait = ({ src, alt, size = "md", className }: KasandraPortraitProps) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={cn(
      "aspect-[3/4] object-cover object-top rounded-xl shadow-soft border border-cc-sand-dark/20",
      sizeClasses[size],
      className
    )}
  />
);

export default KasandraPortrait;
