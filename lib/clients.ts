/**
 * Brands Bellops has worked with, for the home page's Clients section (shown
 * in white over the 3D studio). Logos are one-colour silhouettes of each
 * brand's own logo, taken from its website (mngspirits.com, ospsmed.com and
 * so on), in public/clients. Each logo links to that website. Show only
 * clients who are happy to be named.
 *
 * GrowGuides is set as text, with no link: growguides.me expired on
 * 14 September 2026 (in its redemption period, October 2026), so there is no
 * logo to take and a link could end up somewhere else. Add `url` and a logo
 * once the domain is renewed.
 */
export type Client = {
  name: string;
  /** The client's website. */
  url?: string;
  /** Display height in px; the width follows the file's ratio. */
  logo?: { src: string; width: number; height: number; display: number };
};

/** Shown after the logos as "+20 more". */
export const moreClients = 20;

export const clients: readonly Client[] = [
  {
    name: "Baba Luxury Cars",
    url: "https://www.babaluxurycar.com",
    logo: {
      src: "/clients/baba-luxury-cars.webp",
      width: 384,
      height: 120,
      display: 40,
    },
  },
  {
    name: "Chase Healthcare & Wellness",
    url: "https://www.chw.co.in",
    logo: {
      src: "/clients/chase-healthcare-wellness.webp",
      width: 117,
      height: 168,
      display: 52,
    },
  },
  {
    name: "MNG Spirits",
    url: "https://www.mngspirits.com",
    logo: {
      src: "/clients/mng-spirits.webp",
      width: 338,
      height: 132,
      display: 40,
    },
  },
  {
    name: "Om Sai Pharma & Surgicals",
    url: "https://www.ospsmed.com",
    logo: {
      src: "/clients/om-sai-pharma-surgicals.webp",
      width: 134,
      height: 168,
      display: 52,
    },
  },
  {
    name: "PUSHWebb",
    url: "https://www.pushwebb.com",
    logo: {
      src: "/clients/pushwebb.webp",
      width: 564,
      height: 96,
      display: 26,
    },
  },
  { name: "GrowGuides" },
];
