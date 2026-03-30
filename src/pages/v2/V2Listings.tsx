import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import PropertyCard from "@/components/v2/listings/PropertyCard";
import type { Listing } from "@/components/v2/listings/PropertyCard";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HOMES_COM_URL = "https://www.homes.com/real-estate-agents/kasandra-prieto/s5959r7/";

const V2Listings = () => {
  const { t } = useLanguage();

  useDocumentHead({
    titleEn: "Featured Properties | Kasandra Prieto REALTOR®",
    titleEs: "Propiedades Destacadas | Kasandra Prieto REALTOR®",
    descriptionEn: "Browse Kasandra Prieto's featured Tucson listings. Schedule a showing today.",
    descriptionEs: "Explore las propiedades destacadas de Kasandra Prieto en Tucson. Agende una visita hoy.",
  });

  const { data: activeListings, isLoading: loadingActive } = useQuery({
    queryKey: ["featured-listings-active"],
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

  const { data: soldListings, isLoading: loadingSold } = useQuery({
    queryKey: ["featured-listings-sold"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_listings")
        .select("*")
        .eq("status", "sold")
        .eq("is_featured", true)
        .order("sold_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Listing[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const renderGrid = (listings: Listing[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      );
    }
    if (!listings?.length) {
      return (
        <div className="text-center py-20">
          <p className="text-cc-charcoal/60 text-lg">
            {t("No listings available at this time.", "No hay propiedades disponibles en este momento.")}
          </p>
        </div>
      );
    }
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <PropertyCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  };

  const soldCount = soldListings?.length ?? 0;

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

      {/* Tabbed Grid */}
      <section className="py-16 bg-cc-sand">
        <div className="container mx-auto px-4 max-w-6xl">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mx-auto mb-8 bg-white/80 border border-cc-sand-dark/20">
              <TabsTrigger value="active" className="data-[state=active]:bg-cc-navy data-[state=active]:text-white px-6">
                {t("Active Listings", "Propiedades Activas")}
              </TabsTrigger>
              <TabsTrigger value="sold" className="data-[state=active]:bg-cc-gold data-[state=active]:text-cc-navy px-6">
                {t(`Recently Sold${soldCount ? ` (${soldCount})` : ""}`, `Vendidas${soldCount ? ` (${soldCount})` : ""}`)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {renderGrid(activeListings, loadingActive)}
            </TabsContent>

            <TabsContent value="sold">
              {renderGrid(soldListings, loadingSold)}
            </TabsContent>
          </Tabs>
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
