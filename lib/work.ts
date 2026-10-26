/**
 * Projects shown on the laptop in the studio tour (and in <WorkShowcase />).
 *
 * Screenshots live in /public/projects, named with a short hash of their
 * contents (they're cached for a year, so a new screenshot needs a new name).
 * Keep their ratios so they fill the screens:
 * - image:       16:10, e.g. 1600×1000 (laptop)
 * - mobileImage: ~9:19.5, e.g. 780×1690 (phone)
 * The titles paraphrase each site's own description; edit them freely.
 */
export type WorkProject = {
  /** Unique, URL-safe id; also the case study's address, /work/<slug>. */
  slug: string;
  title: string;
  client: string;
  /** The rest of the case study's <h1>, after "{client}: ". */
  headline: string;
  /** Desktop screenshot shown on the laptop (16:10). */
  image: string;
  /** Mobile screenshot shown on the phone (9:19.5). */
  mobileImage: string;
  /** Where a click goes. Absolute URLs open in a new tab, paths like "/work/x" stay in the site. */
  url: string;
  /**
   * The case study's sections. Each shows only when it's filled in, so leave
   * out anything not yet confirmed: real facts only, and results and quotes
   * only once the client has approved them.
   */
  details?: CaseStudyDetails;
};

export type CaseStudyDetails = {
  /** What the client needed, in a sentence or two. */
  brief?: string;
  /** What Bellops designed and built: one item per line. */
  built?: readonly string[];
  /** The tools and services the site runs on. */
  stack?: readonly string[];
  /** How long it took, e.g. "About 3 weeks, from brief to launch". */
  timeline?: string;
  /** A measured result the client has approved. */
  result?: string;
  /** The client's words, approved by them. */
  quote?: { text: string; name: string; role?: string };
};

export const projects: readonly WorkProject[] = [
  {
    slug: "baba-luxury-cars",
    title: "A showroom site for hand-picked, inspected luxury cars in Delhi",
    client: "Baba Luxury Cars",
    headline: "a showroom website for luxury cars in Delhi",
    image: "/projects/babaluxurycar-desktop.b141fdec.webp",
    mobileImage: "/projects/babaluxurycar-mobile.a47e5d5a.webp",
    url: "https://www.babaluxurycar.com",
  },
  {
    slug: "pushwebb",
    title: "A home for a content, creative and performance agency",
    client: "PUSHWebb",
    headline: "a website for a content, creative and performance agency",
    image: "/projects/pushwebb-desktop-bot.1240bf1f.webp",
    mobileImage: "/projects/pushwebb-mobile-bot.927a202e.webp",
    url: "https://www.pushwebb.com",
  },
  {
    slug: "chase-healthcare-wellness",
    title: "An export site for a WHO-GMP healthcare manufacturer",
    client: "Chase Healthcare & Wellness",
    headline: "an export website for a WHO-GMP manufacturer",
    image: "/projects/chw-desktop.cd0dbb19.webp",
    mobileImage: "/projects/chw-mobile.c1105ef9.webp",
    url: "https://www.chw.co.in",
  },
];

/** A project's case-study page. */
export const caseStudyPath = (project: Pick<WorkProject, "slug">) =>
  `/work/${project.slug}`;

/** The project's own site, without "https://www.", for link text. */
export const projectHost = (project: Pick<WorkProject, "url">) =>
  new URL(project.url).hostname.replace(/^www\./, "");
