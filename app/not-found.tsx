import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { ServiceRows } from "@/components/site/ServiceRows";
import { SiteFooter } from "@/components/site/SiteFooter";
import { workPage } from "@/lib/content";
import { allServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Page not found",
  // Replaces the site-wide "index, follow", so the page's robots tags agree.
  robots: { index: false, follow: true },
};

/**
 * Every unknown address gets a real 404 with this page, never a redirect to
 * the home page.
 */
export default function NotFound() {
  return (
    <div className="site-page">
      <SiteHeader variant="page" />
      <main id="main">
        <section className="wrap case-intro">
          <h1 className="reveal-title case-title">
            This page isn&apos;t here.
          </h1>
          <div className="hero-foot">
            <p className="hero-lead">
              It may have moved, or the address may be mistyped. Start from the
              studio, the work, or one of the services below.
            </p>
            <div className="hero-actions">
              <Link href="/" className="button button--solid">
                The studio
              </Link>
              <Link href={workPage.path} className="button button--ghost">
                Work
              </Link>
            </div>
          </div>
        </section>
        <section aria-label="Services" className="wrap block">
          <ServiceRows items={allServices} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
