import type { ReactNode } from "react";
import Link from "next/link";
import {
  INSTAGRAM_URL,
  aboutPage,
  contactPage,
  services,
  servicesPage,
  site,
  workPage,
} from "@/lib/content";
import { blogPage } from "@/lib/blog";
import { whatsappHref } from "@/lib/contact-links";
import { threeDPage } from "@/lib/three-d";

/**
 * The footer on every page: every service, the work, and how to reach us.
 * `children` adds a small note under the legal line (the home page credits
 * its weather data there).
 */
export function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="foot" data-ga-location="footer">
      <div className="foot-masthead" aria-hidden="true">
        <span>
          Bell<span>Ops</span>.
        </span>
      </div>
      <div className="wrap foot-grid">
        <div className="foot-studio">
          <p className="foot-name">{site.name}</p>
          <p>
            A web design and digital marketing studio. Delhi-based, working
            remotely across India.
          </p>
        </div>
        <nav aria-label="Services" className="foot-col">
          <p className="foot-heading">
            <Link href={servicesPage.path}>Services</Link>
          </p>
          <ul>
            {services.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.nav}</Link>
              </li>
            ))}
            <li>
              <Link href={threeDPage.path}>3D websites</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Studio" className="foot-col">
          <p className="foot-heading">Studio</p>
          <ul>
            <li>
              <Link href="/">The studio</Link>
            </li>
            <li>
              <Link href={aboutPage.path}>About</Link>
            </li>
            <li>
              <Link href={workPage.path}>Work</Link>
            </li>
            <li>
              <Link href={blogPage.path}>Blog</Link>
            </li>
            <li>
              <Link href={contactPage.path}>Contact</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Elsewhere" className="foot-col">
          <p className="foot-heading">Talk to us</p>
          <ul>
            <li>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp-footer"
              >
                WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            {site.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={"social-" + social.label.toLowerCase()}
                >
                  {social.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="wrap foot-legal">
        <span>
          © {site.copyrightYear} {site.name} · Independently minded.
        </span>
        <span>
          Prefer Instagram? DM “START” to{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="instagram-dm-start"
          >
            @bellops.in<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </span>
      </p>
      {children && <p className="wrap foot-note">{children}</p>}
    </footer>
  );
}
