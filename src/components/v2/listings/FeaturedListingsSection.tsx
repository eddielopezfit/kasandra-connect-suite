import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";
import type { Listing } from "./PropertyCard";

const FeaturedListingsSection = () => {
  const { t } = useLanguage();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["featured-listings-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_listings")
        .select("*")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as unknown as Listing[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!listings?.length) return null;

  return (
    <section className="py-16 lg:py-20 bg-cc-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("Featured Properties", "Propiedades Destacadas")}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
            {t("Current Listings", "Listados Actuales")}
          </h2>
          <div className="w-16 h-1 bg-cc-gold mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="rounded-full border-cc-navy text-cc-navy hover:bg-cc-navy hover:text-white px-8">
            <Link to="/listings" className="flex items-center gap-2">
              {t("View All Properties", "Ver Todas las Propiedades")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListingsSection;
