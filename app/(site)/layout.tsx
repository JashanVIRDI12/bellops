import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteMotion } from "@/components/site/SiteMotion";

/** The inner pages (services, work): the studio's night palette around the content. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteMotion>
      <SmoothScroll />
      <SiteHeader variant="page" />
      <main id="main">{children}</main>
      <SiteFooter />
      <div aria-hidden className="grain" />
    </SiteMotion>
  );
}
