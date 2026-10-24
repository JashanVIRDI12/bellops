import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/** The inner pages (services, work): the studio's night palette around the content. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-page">
      <SmoothScroll />
      <SiteHeader variant="page" />
      <main id="main">{children}</main>
      <SiteFooter />
      <div aria-hidden className="grain" />
    </div>
  );
}
