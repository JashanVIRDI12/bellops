import type { Metadata } from "next";
import { services, site } from "./content";

// The public production origin for share cards, canonicals and crawlers. The
// live site is www (the bare domain redirects there), so every absolute URL
// uses it.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.bellops.in",
).origin;

/** The home page's absolute URL, with its trailing slash. */
export const homeUrl = `${siteUrl}/`;

// The home page's title in search results and tabs. Keep it under ~60 characters.
export const siteTitle = `${site.name} — Web Design, 3D Websites, Ads, Social Media & SEO`;

export const socialImage = {
  url: "/brand/share-banner.jpg",
  width: 1200,
  height: 630,
  alt: "Bellops — web design, 3D websites, ads, social media and SEO.",
};

/**
 * A page's share cards (Open Graph and X): its own title, description and
 * path, with the site's name and image. A page's openGraph replaces the
 * layout's whole block, so every page that sets a URL uses this.
 */
export function shareMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      ...(path ? { url: path } : {}),
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      url: homeUrl,
      description: site.description,
      sameAs: site.socials.map((social) => social.href),
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: [
        "Web design",
        "Website development",
        "3D websites",
        "Landing pages",
        "Google Ads",
        "Meta Ads",
        "Social media management",
        "Search engine optimization",
        "Branding",
      ],
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/bellops-wordmark-transparent.png`,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web design and digital marketing services",
        itemListElement: services.items.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.body,
            provider: { "@id": organizationId },
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: site.name,
      url: homeUrl,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: homeUrl,
      name: siteTitle,
      description: site.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteUrl}${socialImage.url}`,
        width: socialImage.width,
        height: socialImage.height,
      },
    },
  ],
};
