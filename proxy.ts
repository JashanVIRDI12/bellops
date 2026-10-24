import { NextResponse, type NextRequest } from "next/server";
import { projects } from "@/lib/work";

const caseStudies = new Set(projects.map((project) => project.slug));

/**
 * Unknown case studies get a real 404 status. The case-study pages share a
 * prerendered shell, so by the time the page itself could call notFound()
 * the response has already started as 200; this check runs first.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !caseStudies.has(decodeURIComponent(slug))) {
    // No route matches /404, so Next.js renders the not-found page with a 404.
    return NextResponse.rewrite(new URL("/404", request.url));
  }
}

export const config = {
  matcher: "/work/:slug",
};
