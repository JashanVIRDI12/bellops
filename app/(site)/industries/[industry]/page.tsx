import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DraftPage, draftMetadata } from "@/components/site/DraftPage";
import { draftPages } from "@/lib/drafts";

// Scaffolds waiting for their copy: see lib/drafts.ts. Unknown industries
// get a real 404 from proxy.ts.
const industries = draftPages.filter((page) =>
  page.path.startsWith("/industries/"),
);
const industryFor = (slug: string) =>
  industries.find((page) => page.path === `/industries/${slug}`);

/*
 * Allowed to block on navigation: every page here is prerendered from
 * generateStaticParams, so the wait is a cached fetch, and blocking keeps
 * the whole page in one piece (no placeholder while its content streams).
 * Without this, Next 16's instant-navigation check flags the params read.
 */
export const instant = false;

export function generateStaticParams() {
  return industries.map((page) => ({
    industry: page.path.slice("/industries/".length),
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/industries/[industry]">): Promise<Metadata> {
  const page = industryFor((await params).industry);
  return page ? draftMetadata(page) : {};
}

export default async function Industry({
  params,
}: PageProps<"/industries/[industry]">) {
  const page = industryFor((await params).industry);
  if (!page) notFound(); // proxy.ts answers 404 first; this is a fallback
  return <DraftPage page={page} />;
}
