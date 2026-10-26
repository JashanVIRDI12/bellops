import Link from "next/link";
import { WhatsAppIcon } from "@/components/contact/icons";
import { contact } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";

/**
 * The close of every inner page: the question, set as large as the page
 * allows. Service pages pass their own WhatsApp link (a quote request for
 * that service); elsewhere it's the general quote request.
 */
export function ContactCta({
  whatsapp = { href: whatsappHref(), track: "whatsapp-closing" },
}: {
  whatsapp?: { href: string; track: string };
}) {
  return (
    <section
      aria-labelledby="closing"
      className="closing"
      data-ga-location="contact"
    >
      <div className="wrap">
        <h2 id="closing" className="closing-title">
          {contact.heading}
        </h2>
        <div className="closing-foot">
          <p className="closing-lead">{contact.body}</p>
          <div className="closing-actions">
            <Link
              href="/#contact"
              className="button button--solid"
              data-track="closing-enquiry"
              data-cta="send_enquiry"
            >
              Send an enquiry
            </Link>
            <a
              href={whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--light"
              data-track={whatsapp.track}
            >
              <WhatsAppIcon />
              {contact.whatsapp}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
