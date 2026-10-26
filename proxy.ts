import { NextResponse, type NextRequest } from "next/server";
import { postBySlug, publishedPosts } from "@/lib/blog";
import { draftPages, hiddenDraftPaths, liveSite as live } from "@/lib/drafts";
import { projects } from "@/lib/work";

const caseStudies = new Set(projects.map((project) => project.slug));
const industries = new Set(
  draftPages
    .map((page) => page.path)
    .filter((path) => path.startsWith("/industries/")),
);

/**
 * Real 404 statuses, set before the page renders. Pages with dynamic segments
 * share a prerendered shell, so by the time the page itself could call
 * notFound() the response has already started as 200; this check runs first.
 *
 * - Unknown case studies, industries and blog posts.
 * - On the live site only (local and preview builds show them for review):
 *   scaffolds still waiting for their copy (lib/drafts.ts), draft posts, and
 *   /blog until a post is published (lib/blog.ts).
 */
export function proxy(request: NextRequest) {
  const path = decodeURIComponent(request.nextUrl.pathname).replace(/\/$/, "");
  const [, section, slug] = path.split("/");
  const missing =
    (section === "work" && slug && !caseStudies.has(slug)) ||
    (section === "industries" && !industries.has(path)) ||
    (section === "blog" && slug && !postBySlug(slug)) ||
    (live && section === "blog" && !slug && publishedPosts.length === 0) ||
    (live && section === "blog" && slug && postBySlug(slug)?.draft) ||
    (live && hiddenDraftPaths.has(path));
  if (missing) {
    // No route matches /404, so it renders the not-found page. The status is
    // set here too: Vercel serves that prerendered page with a 200 otherwise.
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }
}

export const config = {
  matcher: [
    "/work/:slug",
    "/industries/:path*",
    "/blog/:path*",
    "/three-js-development",
    "/3d-product-configurator",
  ],
};
