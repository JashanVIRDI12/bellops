import Link from "next/link";
import { WhatsAppIcon } from "@/components/contact/icons";
import { contact } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";

/** The closing call to action on every inner page. */
export function ContactCta() {
  return (
    <section
      aria-labelledby="contact-cta"
      className="site-container py-20 md:py-28"
    >
      <div className="site-panel">
        <h2 id="contact-cta" className="site-h2">
          {contact.heading}
        </h2>
        <p className="site-lead mt-4">{contact.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#contact" className="intro-cta">
            Send an enquiry
          </Link>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button contact-button--light"
          >
            <WhatsAppIcon />
            {contact.whatsapp}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
