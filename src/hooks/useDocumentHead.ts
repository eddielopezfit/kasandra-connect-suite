import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const PROD_DOMAIN = "https://kasandraprietorealtor.com";

interface DocumentHeadOptions {
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  ogImage?: string;
  canonical?: string;
  /** Override og:type. Defaults to "website". Use "article" for guide detail pages. */
  ogType?: string;
  /** If true, adds noindex,nofollow robots meta — use for ad funnel and dev pages. */
  noindex?: boolean;
}

const DEFAULT_TITLE = "Kasandra Prieto | Tucson Realtor & Podcast Host";
const DEFAULT_DESC = "Your best friend in real estate. Serving the Tucson community with integrity, heart, and bilingual expertise.";
const OG_IMAGE = `${PROD_DOMAIN}/og-kasandra.jpg`;

function upsertMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeNoindexTag() {
  const existing = document.querySelector('meta[name="robots"][content="noindex, nofollow"]');
  if (existing) existing.remove();
}

export function useDocumentHead({
  titleEn,
  titleEs,
  descriptionEn,
  descriptionEs,
  ogImage,
  canonical,
  ogType = "website",
  noindex = false,
}: DocumentHeadOptions) {
  const { language } = useLanguage();

  useEffect(() => {
    const title = language === "en" ? titleEn : titleEs;
    const description = language === "en" ? descriptionEn : descriptionEs;
    const image = ogImage || OG_IMAGE;

    // Auto-generate canonical from current path if none provided
    const canonicalUrl = canonical || `${PROD_DOMAIN}${window.location.pathname}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", image);
    // FIX: was hardcoded "article" — now defaults to "website", override per page
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:site_name", "Kasandra Prieto | Corner Connect");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    // noindex for ad funnel and dev-only pages
    if (noindex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    }

    // Canonical + hreflang
    // FIX: was appending ?lang=es — same URL serves both languages via LanguageContext
    upsertLink("canonical", canonicalUrl);
    upsertLink("alternate", canonicalUrl, "en");
    upsertLink("alternate", canonicalUrl, "es");
    upsertLink("alternate", canonicalUrl, "x-default");

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta("name", "description", DEFAULT_DESC);
      upsertMeta("property", "og:title", DEFAULT_TITLE);
      upsertMeta("property", "og:description", DEFAULT_DESC);
      upsertMeta("property", "og:image", OG_IMAGE);
      upsertMeta("property", "og:type", "website");
      upsertMeta("name", "twitter:image", OG_IMAGE);
      if (noindex) removeNoindexTag();
    };
  }, [language, titleEn, titleEs, descriptionEn, descriptionEs, ogImage, canonical, ogType, noindex]);
}
