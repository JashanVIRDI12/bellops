import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { DOCK_COOKIE } from "@/lib/ab";
import { getPostBySlug } from "@/lib/blog";
import { draftPages, hiddenDraftPaths, liveSite as live } from "@/lib/drafts";
import { projects } from "@/lib/work";

const caseStudies = new Set(projects.map((project) => project.slug));
const industries = new Set(
  draftPages
    .map((page) => page.path)
    .filter((path) => path.startsWith("/industries/")),
);

/**
 * Runs before every page. Two jobs:
 *
 * 1. The A/B test's cookie (AB_TEST_DOCK.md): visitors without one are put
 *    in "icon" or "pill" at random.
 *
 * 2. Real 404 statuses, set before the page renders. Pages with dynamic
 *    segments share a prerendered shell, so by the time the page itself
 *    could call notFound() the response has already started as 200; this
 *    check runs first. It covers:
 *    - unknown case studies, industries and blog posts;
 *    - on the live site only (local and preview builds show them for
 *      review): scaffolds still waiting for their copy (lib/drafts.ts) and
 *      draft posts, unless the draft preview secret is sent (below). The
 *      /blog index itself is always live.
 */
/*
 * Draft posts on the live site, for review: the gate is a secret, not
 * ?preview=1 (drafts hold unapproved claims about real brands). Set
 * DRAFT_PREVIEW_SECRET in Vercel's Production environment, then open
 * /blog/<slug>?preview=<secret> once: a cookie keeps drafts open for a week.
 * The secret also works as an x-draft-preview header. A previewed draft is
 * still noindex (its page says so, and X-Robots-Tag here). Without the
 * variable there's no way in: drafts are 404 on the live site.
 * (Development and Vercel preview deployments show drafts to everyone.)
 */
const PREVIEW_COOKIE = "bellops_draft_preview";

function sameSecret(given: string | null | undefined, secret: string) {
  if (!given) return false;
  const [a, b] = [Buffer.from(given), Buffer.from(secret)];
  return a.length === b.length && timingSafeEqual(a, b);
}

export function proxy(request: NextRequest) {
  const path = decodeURIComponent(request.nextUrl.pathname).replace(/\/$/, "");
  const [, section, slug] = path.split("/");
  const post = section === "blog" && slug ? getPostBySlug(slug) : undefined;
  const secret = process.env.DRAFT_PREVIEW_SECRET;
  const previewQuery = request.nextUrl.searchParams.get("preview");
  const preview =
    !!secret &&
    !!post?.draft &&
    [
      previewQuery,
      request.cookies.get(PREVIEW_COOKIE)?.value,
      request.headers.get("x-draft-preview"),
    ].some((given) => sameSecret(given, secret));
  const missing =
    (section === "work" && slug && !caseStudies.has(slug)) ||
    (section === "industries" && !industries.has(path)) ||
    (section === "blog" && slug && !post) ||
    (live && post?.draft && !preview) ||
    (live && hiddenDraftPaths.has(path));
  // No route matches /404, so it renders the not-found page. The status is
  // set here too: Vercel serves that prerendered page with a 200 otherwise.
  const response = missing
    ? NextResponse.rewrite(new URL("/404", request.url), { status: 404 })
    : NextResponse.next();

  if (preview) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    if (secret && sameSecret(previewQuery, secret))
      response.cookies.set(PREVIEW_COOKIE, secret, {
        path: "/blog",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
  }

  // A/B test dock_pill_v1 (lib/ab.ts): a 50/50 split, sticky for 90 days.
  if (!request.cookies.get(DOCK_COOKIE)) {
    const variant =
      crypto.getRandomValues(new Uint8Array(1))[0]! < 128 ? "icon" : "pill";
    response.cookies.set(DOCK_COOKIE, variant, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Every page (the A/B cookie), so not Next's files, API routes or files
  // with an extension. The 404 checks above only act on their own sections.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
