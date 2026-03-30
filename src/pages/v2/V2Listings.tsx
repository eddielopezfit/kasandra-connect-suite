import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import PropertyCard from "@/components/v2/listings/PropertyCard";
import type { Listing } from "@/components/v2/listings/PropertyCard";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const HOMES_COM_URL = "https://www.homes.com/real-estate-agents/kasandra-prieto/s5959r7/";

const V2Listings = () => {
  const { t } = useLanguage();

  useDocumentHead({
    title: t(
      "Featured Properties | Kasandra Prieto REALTOR®",
      "Propiedades Destacadas | Kasandra Prieto REALTOR®"
    ),
    description: t(
      "Browse Kasandra Prieto's featured Tucson listings. Schedule a showing today.",
      "Explore las propiedades destacadas de Kasandra Prieto en Tucson. Agende una visita hoy."
    ),
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ["featured-listings-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_listings")
        .select("*")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Listing[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <V2Layout>
      {/* Hero */}
      <section className="bg-cc-navy pt-20 pb-14 text-center">
        <div className="container mx-auto px-4">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("Listings by Kasandra Prieto", "Propiedades de Kasandra Prieto")}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mt-3">
            {t("Featured Properties", "Propiedades Destacadas")}
          </h1>
          <p className="text-white/70 mt-3 text-lg max-w-xl mx-auto">
            {t(
              "Realty Executives Arizona Territory · Corner Connect",
              "Realty Executives Arizona Territory · Corner Connect"
            )}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-cc-sand">
        <div className="container mx-auto px-4 max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !listings?.length ? (
            <div className="text-center py-20">
              <p className="text-cc-charcoal/60 text-lg">
                {t("No listings available at this time.", "No hay propiedades disponibles en este momento.")}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* See All CTA */}
      <section className="py-12 bg-cc-ivory text-center">
        <div className="container mx-auto px-4">
          <p className="text-cc-charcoal/70 mb-4">
            {t("Want to see all available listings?", "¿Quieres ver todas las propiedades disponibles?")}
          </p>
          <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-3">
            <a href={HOMES_COM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              {t("See All My Listings", "Ver Todas Mis Propiedades")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
    </V2Layout>
  );
};

export default V2Listings;
