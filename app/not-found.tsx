import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/contact/icons";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { ServiceRows } from "@/components/site/ServiceRows";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  aboutPage,
  contact,
  contactPage,
  servicesPage,
  workPage,
} from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { allServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Page not found",
  // Next adds <meta name="robots" content="noindex"> to every 404 itself;
  // null drops the site-wide robots and googlebot tags, so that's the only one.
  robots: null,
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
            <div className="hero-actions" data-ga-location="not_found">
              <Link href="/" className="button button--solid">
                The studio
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--light"
                data-track="whatsapp-not-found"
              >
                <WhatsAppIcon />
                {contact.whatsapp}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <nav aria-label="Main pages" className="not-found-links">
            <Link href={servicesPage.path}>Services</Link>
            <Link href={workPage.path}>Work</Link>
            <Link href={aboutPage.path}>About</Link>
            <Link href={contactPage.path}>Contact</Link>
          </nav>
        </section>
        <section aria-label="Services" className="wrap block">
          <ServiceRows items={allServices} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
