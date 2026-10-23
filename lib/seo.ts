import { services, site } from "./content";

// Use the public production origin for share cards, canonicals and crawlers.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://bellops.in",
).origin;

// The home page's title in search results and tabs. Keep it under ~60 characters.
export const siteTitle = `${site.name} — Web Design, 3D Websites, Ads, Social Media & SEO`;

export const socialImage = {
  url: "/brand/share-banner.jpg",
  width: 1200,
  height: 630,
  alt: "Bellops — web design, 3D websites, ads, social media and SEO.",
};

const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      url: siteUrl,
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
      url: siteUrl,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
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
