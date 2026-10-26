import Link from "next/link";
import {
  INSTAGRAM_URL,
  services,
  servicesPage,
  site,
  workPage,
} from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";

/** The inner pages' footer: every service, the work, and how to reach us. */
export function SiteFooter() {
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
            A web design and digital marketing studio in Moti Nagar, Delhi, for
            brands across India.
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
          </ul>
        </nav>
        <nav aria-label="Studio" className="foot-col">
          <p className="foot-heading">Studio</p>
          <ul>
            <li>
              <Link href="/">The studio</Link>
            </li>
            <li>
              <Link href={workPage.path}>Work</Link>
            </li>
            <li>
              <Link href="/#contact">Contact</Link>
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
    </footer>
  );
}
