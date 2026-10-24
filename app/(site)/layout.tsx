import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/** The inner pages (services, work): a plain dark page around the content. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-page">
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
