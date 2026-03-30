import { Home, Bed, Bath, Maximize, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: string;
  description_en: string | null;
  description_es: string | null;
  photo_urls: string[];
  mls_number: string | null;
  listing_url: string | null;
  display_order: number;
  sold_price?: number | null;
  sold_date?: string | null;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500 text-white",
  pending: "bg-amber-500 text-white",
  sold: "bg-cc-gold text-cc-navy",
};

const PropertyCard = ({ listing }: { listing: Listing }) => {
  const { t, language } = useLanguage();
  const hasPhoto = listing.photo_urls && listing.photo_urls.length > 0;
  const description = language === "es" ? listing.description_es : listing.description_en;
  const isSold = listing.status === "sold";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const statusLabel =
    listing.status === "active"
      ? t("Active", "Activo")
      : listing.status === "pending"
      ? t("Pending", "Pendiente")
      : t("Sold", "Vendido");

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cc-sand-dark/20 ${isSold ? "opacity-90" : ""}`}>
      {/* Photo / Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasPhoto ? (
          <img
            src={listing.photo_urls[0]}
            alt={listing.address}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSold ? "grayscale-[30%]" : ""}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-cc-navy flex items-center justify-center">
            <Home className="w-16 h-16 text-cc-gold/60" />
          </div>
        )}
        {/* Status badge */}
        <Badge className={`absolute top-3 left-3 ${statusColors[listing.status] || statusColors.active} text-xs font-semibold px-3 py-1 rounded-full shadow-md`}>
          {statusLabel}
        </Badge>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        {/* Price display — sold shows both list and sale price */}
        {isSold && listing.sold_price ? (
          <div>
            <p className="font-serif text-2xl font-bold text-cc-navy">{formatPrice(listing.sold_price)}</p>
            <p className="text-xs text-cc-charcoal/50 line-through">{t("Listed", "Listado")} {formatPrice(listing.price)}</p>
          </div>
        ) : (
          <p className="font-serif text-2xl font-bold text-cc-navy">{formatPrice(listing.price)}</p>
        )}

        <p className="text-sm text-cc-charcoal/80">
          {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-4 text-sm text-cc-charcoal/70">
          {listing.beds != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" /> {listing.beds} {t("bd", "hab")}
            </span>
          )}
          {listing.baths != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" /> {listing.baths} {t("ba", "ba")}
            </span>
          )}
          {listing.sqft != null && (
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4" /> {listing.sqft.toLocaleString()} {t("sqft", "pies²")}
            </span>
          )}
        </div>

        {listing.mls_number && (
          <p className="text-xs text-muted-foreground">MLS# {listing.mls_number}</p>
        )}

        {description && (
          <p className="text-sm text-cc-charcoal/70 line-clamp-2">{description}</p>
        )}

        {/* CTA */}
        <div className="pt-2 flex gap-2">
          {isSold ? (
            <Button asChild className="flex-1 bg-cc-navy hover:bg-cc-navy-dark text-white font-semibold rounded-full text-sm">
              <Link to="/listings">
                {t("See Active Listings", "Ver Propiedades Activas")}
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full text-sm">
              <Link to="/book">
                {t("Schedule a Showing", "Agendar una Visita")}
              </Link>
            </Button>
          )}
          {listing.listing_url && !isSold && (
            <Button variant="outline" size="icon" asChild className="rounded-full border-cc-sand-dark/30">
              <a href={listing.listing_url} target="_blank" rel="noopener noreferrer" aria-label={t("View on homes.com", "Ver en homes.com")}>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
export type { Listing };
