/**
 * Centralized JSON-LD schema generators for SEO.
 * Used with <JsonLd data={...} /> component.
 */

export function realEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Kasandra Prieto",
    jobTitle: "Associate Broker, REALTOR®",
    url: "https://kasandraprietorealtor.com",
    image: "https://kasandraprietorealtor.com/kasandra-prieto.jpg",
    telephone: "+1-520-349-3248",
    email: "kasandra@prietorealestategroup.com",
    description:
      "Kasandra Prieto is a bilingual REALTOR® and Associate Broker in Tucson, AZ — specializing in residential real estate, cash offers, and personalized buyer/seller strategy sessions.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4007 E Paradise Falls Dr, Suite 125",
      addressLocality: "Tucson",
      addressRegion: "AZ",
      postalCode: "85712",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: "Tucson",
      containedInPlace: { "@type": "State", name: "Arizona" },
    },
    knowsLanguage: ["en", "es"],
    memberOf: {
      "@type": "Organization",
      name: "Realty Executives Arizona Territory",
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Corner Connect Real Estate",
    url: "https://kasandraprietorealtor.com",
    telephone: "+1-520-349-3248",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4007 E Paradise Falls Dr, Suite 125",
      addressLocality: "Tucson",
      addressRegion: "AZ",
      postalCode: "85712",
      addressCountry: "US",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "$$",
  };
}

export function faqPageSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function aggregateRatingSchema(
  ratingValue = 5.0,
  reviewCount = 126,
) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Kasandra Prieto",
    url: "https://kasandraprietorealtor.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      bestRating: 5,
      worstRating: 1,
      reviewCount,
    },
  };
}
