import Link from "next/link";
import { WhatsAppIcon } from "@/components/contact/icons";
import { contact } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";

/** The close of every inner page: the question, set as large as the page allows. */
export function ContactCta() {
  return (
    <section aria-labelledby="closing" className="closing">
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
            >
              Send an enquiry
            </Link>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--light"
              data-track="whatsapp-closing"
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
