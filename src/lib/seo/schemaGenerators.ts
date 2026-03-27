/**
 * Centralized JSON-LD schema generators for SEO.
 * Used with <JsonLd data={...} /> component.
 */

// ─── Shared constants ──────────────────────────────────────────────────────────

const AGENT_NAME = "Kasandra Prieto";
const BROKERAGE_NAME = "Corner Connect Real Estate";
const BROKERAGE_DBA = "Realty Executives Arizona Territory";
const LICENSE_NUMBER = "LC706691000";
const ADDRESS_STREET = "4007 E Paradise Falls Dr, Suite 125";
const ADDRESS_CITY = "Tucson";
const ADDRESS_STATE = "AZ";
const ADDRESS_ZIP = "85712";
const ADDRESS_COUNTRY = "US";
const PHONE = "(520) 349-3248";
const EMAIL = "kasandra@prietorealestategroup.com";
const WEBSITE = "https://kasandraprietorealtor.com";
const REVIEW_COUNT = 126;
const REVIEW_RATING = 5.0;
const GEO_LAT = 32.2226;
const GEO_LNG = -110.9747;

const sharedAddress = {
  "@type": "PostalAddress",
  streetAddress: ADDRESS_STREET,
  addressLocality: ADDRESS_CITY,
  addressRegion: ADDRESS_STATE,
  postalCode: ADDRESS_ZIP,
  addressCountry: ADDRESS_COUNTRY,
};

const sharedContactPoint = {
  "@type": "ContactPoint",
  telephone: PHONE,
  contactType: "customer service",
  areaServed: "Tucson, AZ",
  availableLanguage: ["English", "Spanish"],
};

const sharedAggregateRating = {
  "@type": "AggregateRating",
  ratingValue: REVIEW_RATING.toString(),
  reviewCount: REVIEW_COUNT.toString(),
  bestRating: "5",
  worstRating: "1",
};

// ─── Schema generators ─────────────────────────────────────────────────────────

/**
 * RealEstateAgent schema for Kasandra Prieto.
 * Suitable for homepage, about page, and contact page.
 */
export function realEstateAgentSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: AGENT_NAME,
    jobTitle: "Licensed REALTOR®",
    description:
      "Kasandra Prieto is a bilingual REALTOR® licensed in Arizona with 20+ years serving the Tucson and Pima County real estate market. Specializing in residential sales, cash offers, first-time buyers, military VA loans, and inherited properties.",
    url: WEBSITE,
    telephone: PHONE,
    email: EMAIL,
    image: `${WEBSITE}/og-image.jpg`,
    address: sharedAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO_LAT,
      longitude: GEO_LNG,
    },
    contactPoint: sharedContactPoint,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Real Estate License",
      recognizedBy: {
        "@type": "Organization",
        name: "Arizona Department of Real Estate",
      },
      identifier: LICENSE_NUMBER,
    },
    worksFor: {
      "@type": "RealEstateAgent",
      name: BROKERAGE_NAME,
      alternateName: BROKERAGE_DBA,
      address: sharedAddress,
      url: WEBSITE,
    },
    knowsLanguage: ["en", "es"],
    areaServed: [
      {
        "@type": "City",
        name: "Tucson",
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Pima County",
          containedInPlace: { "@type": "State", name: "Arizona" },
        },
      },
      { "@type": "City", name: "Marana" },
      { "@type": "City", name: "Sahuarita" },
      { "@type": "City", name: "Vail" },
      { "@type": "City", name: "Oro Valley" },
    ],
    aggregateRating: sharedAggregateRating,
    sameAs: [
      "https://www.zillow.com/profile/KasandraPrieto",
      "https://www.realtor.com/realestateagents/kasandra-prieto",
    ],
  };
}

/**
 * LocalBusiness schema for Corner Connect Real Estate.
 * Suitable for homepage and contact page.
 */
export function localBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    name: BROKERAGE_NAME,
    alternateName: BROKERAGE_DBA,
    description:
      "Corner Connect Real Estate, operating under Realty Executives Arizona Territory, serves buyers and sellers throughout Tucson and Pima County with bilingual real estate expertise.",
    url: WEBSITE,
    telephone: PHONE,
    email: EMAIL,
    image: `${WEBSITE}/og-image.jpg`,
    logo: `${WEBSITE}/logo.png`,
    priceRange: "$$",
    address: sharedAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO_LAT,
      longitude: GEO_LNG,
    },
    contactPoint: sharedContactPoint,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "15:00",
      },
    ],
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Check, Wire Transfer",
    areaServed: "Tucson, AZ and Pima County",
    aggregateRating: sharedAggregateRating,
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${ADDRESS_STREET}, ${ADDRESS_CITY}, ${ADDRESS_STATE} ${ADDRESS_ZIP}`)}`,
    sameAs: [WEBSITE],
  };
}

/**
 * FAQPage schema.
 * @param faqs - Array of question/answer pairs
 */
export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/**
 * Standalone AggregateRating schema for 126+ verified reviews.
 */
export function aggregateRatingSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "RealEstateAgent",
      name: AGENT_NAME,
      url: WEBSITE,
      address: sharedAddress,
    },
    ratingValue: REVIEW_RATING.toString(),
    reviewCount: REVIEW_COUNT.toString(),
    bestRating: "5",
    worstRating: "1",
    description: `${REVIEW_COUNT}+ verified client reviews for ${AGENT_NAME}, bilingual REALTOR® serving Tucson and Pima County, AZ.`,
  };
}

/**
 * HowTo schema — generic utility for step-by-step content.
 * @param name  - Title of the how-to guide
 * @param steps - Ordered list of step name + text
 */
export function howToSchema(
  name: string,
  steps: Array<{ name: string; text: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description: `Step-by-step guide: ${name}. Provided by ${AGENT_NAME}, bilingual REALTOR® at ${BROKERAGE_NAME} in Tucson, AZ.`,
    image: `${WEBSITE}/og-image.jpg`,
    author: {
      "@type": "Person",
      name: AGENT_NAME,
      url: WEBSITE,
      jobTitle: "Licensed REALTOR®",
      telephone: PHONE,
      email: EMAIL,
    },
    publisher: {
      "@type": "Organization",
      name: BROKERAGE_NAME,
      url: WEBSITE,
    },
    step: steps.map(({ name: stepName, text }, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: stepName,
      text,
    })),
  };
}
