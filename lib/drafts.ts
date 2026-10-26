import type { Crumb } from "./schema";

/**
 * Vercel's production deployment (www.bellops.in), not a preview or a local
 * build. Drafts (here and in lib/blog.ts) only show where this is false.
 */
export const liveSite = process.env.VERCEL_ENV === "production";

/**
 * Pages scaffolded ahead of their copy, which comes from the Content Writer
 * once Jashan approves it. Until then each one:
 * - shows a placeholder (components/site/DraftPage.tsx),
 * - answers 404 on the live site (proxy.ts) and stays out of the sitemap,
 *   so no placeholder is ever indexed; local and preview builds show it.
 *
 * To launch one: write its page (replacing <DraftPage />), set a real title
 * and description here, then set `ready: true`. It then goes live, into the
 * sitemap and search. Never invent copy, prices or results for these pages.
 */
export type DraftPage = {
  path: string;
  /** Working name: the H1 and the title until the real copy lands. */
  name: string;
  /** PLACEHOLDER until the Content Writer supplies it. */
  description: string;
  /** The hub above it in the breadcrumb, if it has a page. */
  parent?: Required<Crumb>;
  ready: boolean;
};

const services = { label: "Services", href: "/services" };
const placeholder = "PLACEHOLDER: description from the Content Writer.";

export const draftPages: readonly DraftPage[] = [
  {
    path: "/three-js-development",
    name: "Three.js development",
    description: placeholder,
    parent: services,
    ready: false,
  },
  {
    path: "/3d-product-configurator",
    name: "3D product configurator",
    description: placeholder,
    parent: services,
    ready: false,
  },
  {
    path: "/industries/luxury-cars",
    name: "Websites for luxury cars",
    description: placeholder,
    ready: false,
  },
  {
    path: "/industries/healthcare",
    name: "Websites for healthcare",
    description: placeholder,
    ready: false,
  },
  {
    path: "/industries/luxury-brands",
    name: "Websites for luxury brands",
    description: placeholder,
    ready: false,
  },
];

export function draftPage(path: string): DraftPage {
  const page = draftPages.find((draft) => draft.path === path);
  if (!page) throw new Error(`No draft page at ${path}`);
  return page;
}

/** Paths that answer 404 on the live site: drafts still waiting for copy. */
export const hiddenDraftPaths: ReadonlySet<string> = new Set(
  draftPages.filter((draft) => !draft.ready).map((draft) => draft.path),
);
