import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { servicePages, workPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Page not found",
  // Replaces the site-wide "index, follow", so the page's robots tags agree.
  robots: { index: false, follow: true },
};

/**
 * Every unknown address (/services, /blog, /about, /contact for now) gets a
 * real 404 with this page, never a redirect to the home page.
 */
export default function NotFound() {
  return (
    <div className="site-page">
      <SiteHeader />
      <main id="main" className="site-container pt-20 pb-28 md:pt-28">
        <p className="site-eyebrow">404</p>
        <h1 className="site-h1 mt-4">This page isn&apos;t here.</h1>
        <p className="site-lead mt-6">
          It may have moved, or the address may be mistyped. These are a good
          place to start:
        </p>
        <ul className="mt-9 flex flex-wrap gap-3">
          <li>
            <Link href="/" className="intro-cta">
              The studio
            </Link>
          </li>
          <li>
            <Link href={workPage.path} className="site-button-ghost">
              Work
            </Link>
          </li>
          <li>
            <Link
              href={servicePages.premium.path}
              className="site-button-ghost"
            >
              {servicePages.premium.navLabel}
            </Link>
          </li>
          <li>
            <Link
              href={servicePages.landing.path}
              className="site-button-ghost"
            >
              {servicePages.landing.navLabel}
            </Link>
          </li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
