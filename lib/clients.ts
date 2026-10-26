/**
 * Brands Bellops has worked with, for the home page's Clients section (shown
 * in white over the 3D studio). Logos are one-colour silhouettes of each
 * brand's own logo, taken from its website (mngspirits.com, ospsmed.com and
 * so on), in public/clients. Show only clients who are happy to be named.
 *
 * A logo links to the client's case study when there is one (`caseStudy`,
 * a slug in lib/work.ts); the strip never sends visitors off the site.
 *
 * GrowGuides is set as text: growguides.me expired on 14 September 2026 (in
 * its redemption period, October 2026), so there is no logo to take.
 */
export type Client = {
  name: string;
  /** Slug of the client's case study in lib/work.ts, if it has one. */
  caseStudy?: string;
  /** Display height in px; the width follows the file's ratio. */
  logo?: { src: string; width: number; height: number; display: number };
};

/** Shown after the logos as "+20 more". */
export const moreClients = 20;

export const clients: readonly Client[] = [
  {
    name: "Baba Luxury Cars",
    caseStudy: "baba-luxury-cars",
    logo: {
      src: "/clients/baba-luxury-cars.webp",
      width: 384,
      height: 120,
      display: 40,
    },
  },
  {
    name: "Chase Healthcare & Wellness",
    caseStudy: "chase-healthcare-wellness",
    logo: {
      src: "/clients/chase-healthcare-wellness.webp",
      width: 117,
      height: 168,
      display: 52,
    },
  },
  {
    name: "MNG Spirits",
    logo: {
      src: "/clients/mng-spirits.webp",
      width: 338,
      height: 132,
      display: 40,
    },
  },
  {
    name: "Om Sai Pharma & Surgicals",
    logo: {
      src: "/clients/om-sai-pharma-surgicals.webp",
      width: 134,
      height: 168,
      display: 52,
    },
  },
  {
    name: "PUSHWebb",
    caseStudy: "pushwebb",
    logo: {
      src: "/clients/pushwebb.webp",
      width: 564,
      height: 96,
      display: 26,
    },
  },
  { name: "GrowGuides" },
];
