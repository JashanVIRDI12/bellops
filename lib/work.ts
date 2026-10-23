/**
 * Projects shown on the laptop in the studio tour (and in <WorkShowcase />).
 *
 * Screenshots live in /public/work. Keep their ratios so they fill the screens:
 * - image:       16:10, e.g. 1600×1000 (laptop)
 * - mobileImage: ~9:19.5, e.g. 780×1690 (phone)
 * The titles paraphrase each site's own description; edit them freely.
 */
export type WorkProject = {
  /** Unique, URL-safe id. */
  slug: string;
  title: string;
  client: string;
  /** Desktop screenshot shown on the laptop (16:10). */
  image: string;
  /** Mobile screenshot shown on the phone (9:19.5). */
  mobileImage: string;
  /** Where a click goes. Absolute URLs open in a new tab, paths like "/work/x" stay in the site. */
  url: string;
};

export const projects: readonly WorkProject[] = [
  {
    slug: "baba-luxury-cars",
    title: "A showroom site for hand-picked, inspected luxury cars in Delhi",
    client: "Baba Luxury Cars",
    image: "/work/babaluxurycar-desktop.webp",
    mobileImage: "/work/babaluxurycar-mobile.webp",
    url: "https://www.babaluxurycar.com",
  },
  {
    slug: "pushwebb",
    title: "A home for a content, creative and performance agency",
    client: "PUSHWebb",
    image: "/work/pushwebb-desktop-bot.webp",
    mobileImage: "/work/pushwebb-mobile-bot.webp",
    url: "https://www.pushwebb.com",
  },
  {
    slug: "chase-healthcare",
    title: "An export site for a WHO-GMP healthcare manufacturer",
    client: "Chase Healthcare & Wellness",
    image: "/work/chw-desktop.webp",
    mobileImage: "/work/chw-mobile.webp",
    url: "https://www.chw.co.in",
  },
];
