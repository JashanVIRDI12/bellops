import type { Metadata } from "next";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { WhatsAppIcon } from "@/components/contact/icons";
import { StudioHero } from "@/components/site/StudioHero";
import {
  INSTAGRAM_URL,
  contact,
  contactPage,
  enquiryForm,
} from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { breadcrumbList, jsonLd, webPage, type Crumb } from "@/lib/schema";
import { feedTypes, shareMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: contactPage.title },
  description: contactPage.description,
  alternates: { canonical: contactPage.path, types: feedTypes },
  ...shareMetadata({
    title: contactPage.title,
    description: contactPage.description,
    path: contactPage.path,
  }),
};

const trail: Crumb[] = [{ label: "Home", href: "/" }, { label: "Contact" }];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    webPage("ContactPage", contactPage),
    breadcrumbList(trail, contactPage.path),
  ],
};

/** The enquiry form and WhatsApp, on a page of their own. */
export default function Contact() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={contactPage.hour}
        crumbs={trail}
        heading={contact.heading}
        lead={contact.body}
      >
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="button button--light"
          data-track="whatsapp-contact-page"
        >
          <WhatsAppIcon />
          {contact.whatsapp}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </StudioHero>
      {/* id="contact": the floating WhatsApp button steps aside here. */}
      <section
        id="contact"
        aria-labelledby="enquiry"
        className="wrap split block"
        data-ga-location="contact"
      >
        <div>
          <h2 id="enquiry" className="block-title">
            {enquiryForm.label}
          </h2>
          <p className="block-note contact-page-note">
            Prefer Instagram? DM “START” to{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
              data-track="instagram-dm-start"
            >
              @bellops.in
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <EnquiryForm />
      </section>
    </>
  );
}
