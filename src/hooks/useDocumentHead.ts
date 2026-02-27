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

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
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
    upsertMeta("name", "twitter:image", image);

    if (canonical) {
      upsertLink("canonical", canonical);
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
