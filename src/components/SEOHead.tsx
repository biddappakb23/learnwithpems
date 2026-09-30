import React, { useEffect } from "react";
import { SEOMetadata, SITE_NAME } from "../services/seo";

interface SEOHeadProps {
  metadata: SEOMetadata;
}

/**
 * SEOHead Component
 * Dynamically updates document title, meta tags, canonical links, OpenGraph, Twitter tags,
 * and JSON-LD structured data on client-side route changes.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ metadata }) => {
  useEffect(() => {
    // 1. Update Title
    document.title = metadata.title;

    // Helper to create or update meta tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Primary Meta Tags
    setMetaTag("name", "description", metadata.description);
    setMetaTag("name", "author", "Pemmaiah U. T.");
    setMetaTag(
      "name",
      "robots",
      metadata.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", metadata.canonicalUrl);

    // 4. OpenGraph Tags
    setMetaTag("property", "og:title", metadata.ogTitle || metadata.title);
    setMetaTag("property", "og:description", metadata.ogDescription || metadata.description);
    setMetaTag("property", "og:url", metadata.canonicalUrl);
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:type", metadata.ogType || "website");
    if (metadata.ogImage) {
      setMetaTag("property", "og:image", metadata.ogImage);
    }

    // 5. Twitter / X Cards
    setMetaTag("name", "twitter:card", metadata.twitterCard || "summary_large_image");
    setMetaTag("name", "twitter:title", metadata.ogTitle || metadata.title);
    setMetaTag("name", "twitter:description", metadata.ogDescription || metadata.description);
    if (metadata.ogImage) {
      setMetaTag("name", "twitter:image", metadata.ogImage);
    }

    // 6. JSON-LD Structured Data
    const existingJsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    existingJsonLd.forEach((tag) => tag.remove());

    if (metadata.schemaJson && metadata.schemaJson.length > 0) {
      metadata.schemaJson.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [metadata]);

  return null;
};
