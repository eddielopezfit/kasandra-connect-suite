import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentHeadOptions {
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  ogImage?: string;
  canonical?: string;
}

const DEFAULT_TITLE = "Kasandra Prieto | Tucson Realtor & Podcast Host";
const DEFAULT_DESC = "Your best friend in real estate. Serving the Tucson community with integrity, heart, and bilingual expertise.";
const OG_IMAGE = "/og-kasandra.jpg";

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

export function useDocumentHead({
  titleEn,
  titleEs,
  descriptionEn,
  descriptionEs,
  ogImage,
  canonical,
}: DocumentHeadOptions) {
  const { language } = useLanguage();

  useEffect(() => {
    const title = language === "en" ? titleEn : titleEs;
    const description = language === "en" ? descriptionEn : descriptionEs;
    const image = ogImage || OG_IMAGE;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:type", "article");
    upsertMeta("property", "og:site_name", "Kasandra Prieto | Corner Connect");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    if (canonical) {
      upsertLink("canonical", canonical);
      // hreflang alternates for EN/ES
      upsertLink("alternate", canonical, "en");
      upsertLink("alternate", canonical.replace('/v2/', '/v2/').replace('?lang=en', '') + '?lang=es', "es");
      upsertLink("alternate", canonical, "x-default");
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta("name", "description", DEFAULT_DESC);
      upsertMeta("property", "og:title", DEFAULT_TITLE);
      upsertMeta("property", "og:description", DEFAULT_DESC);
      upsertMeta("property", "og:image", OG_IMAGE);
      upsertMeta("name", "twitter:image", OG_IMAGE);
    };
  }, [language, titleEn, titleEs, descriptionEn, descriptionEs, ogImage, canonical]);
}
