/**
 * Brands Bellops has worked with, for the logo strip under the home page's
 * hero. Logos are one-colour silhouettes of each brand's own logo (from its
 * website), in public/clients. Show only clients who are happy to be named.
 * GrowGuides has no logo here yet: growguides.me didn't resolve (October
 * 2026), so its name is set as text until a logo file arrives.
 */
export type Client = {
  name: string;
  /** Display height in px; the width follows the file's ratio. */
  logo?: { src: string; width: number; height: number; display: number };
};

export const clients: readonly Client[] = [
  {
    name: "Baba Luxury Cars",
    logo: {
      src: "/clients/baba-luxury-cars.webp",
      width: 384,
      height: 120,
      display: 40,
    },
  },
  {
    name: "Chase Healthcare & Wellness",
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
    logo: {
      src: "/clients/pushwebb.webp",
      width: 564,
      height: 96,
      display: 26,
    },
  },
  { name: "GrowGuides" },
];
