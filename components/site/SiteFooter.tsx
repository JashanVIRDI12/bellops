import Link from "next/link";
import { servicePages, site, workPage } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";

/** The inner pages' footer: every service page, the work, and how to reach us. */
export function SiteFooter() {
  return (
    <footer className="site-container border-t border-white/10 py-10 text-sm text-white/70">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <p className="max-w-sm">
          <span className="font-heading text-base font-medium text-white">
            {site.name}
          </span>
          <span className="mt-2 block">
            A web design and digital marketing studio in India.
          </span>
        </p>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2">
          <Link className="site-footer-link" href={servicePages.premium.path}>
            {servicePages.premium.navLabel}
          </Link>
          <Link className="site-footer-link" href={workPage.path}>
            Work
          </Link>
          <Link className="site-footer-link" href={servicePages.landing.path}>
            {servicePages.landing.navLabel}
          </Link>
          <Link className="site-footer-link" href="/#contact">
            Contact
          </Link>
          {site.socials.map((social) => (
            <a
              key={social.label}
              className="site-footer-link"
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
          <a
            className="site-footer-link"
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </div>
      <p className="mt-10 text-xs text-white/50">
        © {site.copyrightYear} {site.name}
      </p>
    </footer>
  );
}
