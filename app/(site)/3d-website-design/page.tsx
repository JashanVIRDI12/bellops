import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/contact/icons";
import { ContactCta } from "@/components/site/ContactCta";
import { Faq } from "@/components/site/Faq";
import { StudioHero } from "@/components/site/StudioHero";
import { WorkShowcase } from "@/components/site/WorkShowcase";
import { contact, servicesPage } from "@/lib/content";
import { serviceWhatsappHref, serviceWhatsappTrack } from "@/lib/contact-links";
import {
  breadcrumbList,
  faqPage,
  jsonLd,
  service,
  type Crumb,
} from "@/lib/schema";
import { feedTypes, shareMetadata } from "@/lib/seo";
import {
  customModelPrice,
  threeDPage as page,
  threeDRates,
} from "@/lib/three-d";
import { projects } from "@/lib/work";

export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: page.path, types: feedTypes },
  ...shareMetadata({
    title: page.shareTitle,
    description: page.shareDescription,
    path: page.path,
  }),
};

const trail: Crumb[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: servicesPage.path },
  { label: page.nav },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...service({
        path: page.path,
        name: "3D website design",
        description: page.description,
      }),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "3D website design services",
        itemListElement: page.services.items.map((item) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: item.title },
        })),
      },
    },
    faqPage(page.faqs),
    breadcrumbList(trail, page.path),
  ],
};

/** WhatsApp here asks for a quote for a 3D website, from the lowest 3D rate. */
const whatsapp = {
  href: serviceWhatsappHref("3D website design", threeDRates[0]!.price),
  track: serviceWhatsappTrack(page.path),
};

/** The 3D website design page: what we build, how, how long, for how much. */
export default function ThreeDWebsiteDesign() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <StudioHero
        hour={page.hour}
        crumbs={trail}
        heading={page.heading}
        lead={page.lead}
      >
        <Link
          href="/#contact"
          className="button button--solid"
          data-cta="get_quote"
        >
          Get a quote
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
        <a href="#selected-work" className="button button--ghost">
          See our work
        </a>
      </StudioHero>

      <section aria-labelledby="why" className="wrap split block">
        <h2 id="why" className="block-title">
          {page.why.heading}
        </h2>
        <div className="page-copy">
          <p>{page.intro}</p>
          {page.why.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="services-3d" className="wrap split block">
        <h2 id="services-3d" className="block-title">
          {page.services.heading}
        </h2>
        <ul className="points">
          {page.services.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>
                {item.body}
                {"link" in item && item.link && (
                  <>
                    {" "}
                    <Link href={item.link.href} className="text-link">
                      {item.link.label}
                    </Link>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="process-3d"
        className="wrap split process block"
      >
        <div className="process-head">
          <h2 id="process-3d" className="block-title">
            {page.process.heading}
          </h2>
          <p className="block-note">{page.process.note}</p>
        </div>
        <ol className="process-steps">
          {page.process.steps.map((step, index) => (
            <li key={step.title} className="process-step">
              <span className="process-number" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="timeline" className="wrap split block">
        <h2 id="timeline" className="block-title">
          {page.timeline.heading}
        </h2>
        <div className="page-copy">
          <p>{page.timeline.intro}</p>
          <RateTable column="Typical timeline" pick="timeline" />
          <p>{page.timeline.after}</p>
        </div>
      </section>

      <section aria-labelledby="pricing" className="wrap split block">
        <h2 id="pricing" className="block-title">
          {page.pricing.heading}
        </h2>
        <div className="page-copy">
          <p>{page.pricing.intro}</p>
          <RateTable column="Price" pick="price" />
          <p>{page.pricing.mixed}</p>
          <p>
            Custom 3D models made just for you: {customModelPrice.toLowerCase()}
            . Licensed models from 3D marketplaces are included.
          </p>
          <h3>What affects the price</h3>
          <ul>
            {page.pricing.factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
          <p>{page.pricing.terms}</p>
        </div>
      </section>

      <section aria-labelledby="stack" className="wrap split block">
        <div>
          <h2 id="stack" className="block-title">
            {page.stack.heading}
          </h2>
          <p className="block-note">{page.stack.intro}</p>
        </div>
        <ul className="points">
          {page.stack.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="performance" className="wrap split block">
        <div>
          <h2 id="performance" className="block-title">
            {page.performance.heading}
          </h2>
          <p className="block-note">{page.performance.intro}</p>
        </div>
        <ul className="points">
          {page.performance.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <WorkShowcase projects={projects} id="selected-work" />

      <section aria-labelledby="why-us" className="wrap split block">
        <div>
          <h2 id="why-us" className="block-title">
            {page.whyUs.heading}
          </h2>
          <p className="block-note">
            Want a premium site without heavy 3D?{" "}
            <Link href="/premium-website-design" className="text-link">
              Premium website design
            </Link>
          </p>
        </div>
        <ul className="points">
          {page.whyUs.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <Faq items={page.faqs} />
      <ContactCta whatsapp={whatsapp} />
    </>
  );
}

/** The kinds of 3D project, with their price or timeline. */
function RateTable({
  column,
  pick,
}: {
  column: string;
  pick: "price" | "timeline";
}) {
  return (
    <div className="rate-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">{column}</th>
          </tr>
        </thead>
        <tbody>
          {threeDRates.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{row[pick]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
