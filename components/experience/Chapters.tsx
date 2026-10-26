import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "./tour.css";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { WhatsAppIcon } from "@/components/contact/icons";
import { blogPage, publishedPosts } from "@/lib/blog";
import { clients, moreClients } from "@/lib/clients";
import {
  INSTAGRAM_URL,
  aboutPage,
  approach,
  contact,
  contactPage,
  intro,
  services,
  servicesPage,
  site,
  studio,
  workPage,
} from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { aboutBellops, homeFaqs, workIntro } from "@/lib/home";
import { formatPrice } from "@/lib/pricing";
import { threeDPage, threeDRates } from "@/lib/three-d";
import { caseStudyPath, projectHost, projects } from "@/lib/work";
import { GlideLink } from "./GlideLink";

/*
 * The tour's text. Each `data-beat` section is one camera shot; its height sets
 * how long the camera holds there (see useBeatTracker). Inside, a sticky frame
 * keeps the text on screen while the shot holds.
 *
 * Text stays white over a feathered scrim so it reads during camera moves as
 * well as on the settled shot. Copy sits below the laptop or beside it;
 * the narrower mobile framing uses a compact services grid.
 *
 * On phones, copy in the middle sections sits a little higher (pb-24) to
 * leave room for the floating WhatsApp button (ContactDock).
 */

const frame = "scene-frame sticky top-0 flex h-svh px-6 md:px-12 lg:px-16";

/** The 3D rates shown on the home page: the one-page start and the full site. */
const featuredRates = threeDRates.filter((row) =>
  ["3D landing page (one page)", "Full 3D website"].includes(row.name),
);

function Scrim() {
  return <div aria-hidden data-scrim className="scene-scrim" />;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-violet-soft text-sm font-bold">{children}</p>;
}

export function Chapters() {
  return (
    <>
      {/* 0 · Intro: a full-screen headline over the view out of the window,
          filling the large pane left of the window frame. Description and
          buttons share a strip along the bottom. Two layers overlap here: the
          headline's colors invert whatever is behind it, the rest keeps its
          own colors (see IntroLayer). */}
      <section
        id="intro"
        data-beat
        data-ga-location="hero"
        className="intro-section relative h-[125svh]"
      >
        <IntroLayer part="headline" />
        <IntroLayer part="rest" />
      </section>

      {/* 1 · Studio: stacked in the lower left, below the desk. */}
      <section id="studio" data-beat className="relative h-[165svh]">
        <div className={`${frame} items-end pb-24 md:pb-14`}>
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-xl">
            <h2
              data-reveal
              className="text-display font-heading font-medium text-balance"
            >
              {studio.heading}
            </h2>
            <p className="mt-5 max-w-[46ch] font-medium text-white/90">
              {studio.body}
            </p>
          </div>
        </div>
      </section>

      {/* 2 · Approach: left aligned over the glass, beside the plant. */}
      <section id="approach" data-beat className="relative h-[165svh]">
        <div
          className={`${frame} scene-frame-side scene-frame-left items-end pb-24 md:items-center md:pb-0`}
        >
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-sm">
            <h2
              data-reveal
              className="text-title font-heading font-medium text-balance"
            >
              {approach.heading}
            </h2>
            <ul className="mt-7 space-y-5">
              {approach.points.map((point) => (
                <li key={point.title}>
                  <h3 className="text-violet-soft font-bold">{point.title}</h3>
                  <p className="mt-1 font-medium text-white/90">{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 · 3D websites: low across the desk toward the sun. The page itself
          is the proof; the copy sits on the right, over the dark desk. */}
      <section id="three-d" data-beat className="relative h-[165svh]">
        <div
          className={`${frame} scene-frame-side items-end pb-24 md:items-center md:justify-end md:pb-0`}
        >
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-md">
            <Eyebrow>Real-time 3D</Eyebrow>
            <h2
              data-reveal
              className="text-title font-heading mt-3 font-medium text-balance"
            >
              You&apos;re scrolling through a 3D website.
            </h2>
            <p className="mt-5 max-w-[44ch] font-medium text-white/90">
              This studio is a real-time scene built with Three.js and WebGL,
              lit for your local time and weather. We build sites like it for
              brands that want to be remembered, and every scene ships with a
              lighter version for slower phones.
            </p>
            <dl className="tour-rates mt-6">
              {featuredRates.map((row) => (
                <div key={row.name}>
                  <dt>{row.name}</dt>
                  <dd>
                    {row.price}
                    <span> · {row.timeline}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6">
              <Link
                href={threeDPage.path}
                className="tour-link"
                data-cta="three_d_page"
              >
                See how we build 3D websites
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 4–6 · Work: over the dark desk, bottom left; the laptop shows the site. */}
      {projects.map((project, index) => (
        <section
          key={project.slug}
          id={index === 0 ? "work" : undefined}
          data-beat
          aria-label={`Project ${index + 1} of ${projects.length}: ${project.client}`}
          className="relative h-[150svh]"
        >
          <div className={`${frame} items-end pb-24 md:pb-14`}>
            <Scrim />
            <div data-reveal-block className="scene-copy w-full max-w-md">
              {index === 0 && (
                <p className="mb-4 max-w-[40ch] text-sm font-medium text-white/80">
                  {workIntro}
                </p>
              )}
              <Eyebrow>
                Selected work, {index + 1} of {projects.length}
              </Eyebrow>
              <h2
                data-reveal
                className="text-title font-heading mt-3 font-medium"
              >
                {project.client}
              </h2>
              <p className="mt-3 max-w-[42ch] font-medium text-white/90">
                {project.title}
              </p>
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href={caseStudyPath(project)}
                  className="tour-link"
                  data-track={`case-study-${project.slug}`}
                >
                  Read the {project.client} case study
                </Link>
                <ExternalLink
                  href={project.url}
                  track={`project-${project.slug}`}
                >
                  Visit {projectHost(project)}
                </ExternalLink>
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* 7 · Clients: pulled back from the laptop to the windows. The logos
          sit in a row along the bottom, in white. */}
      <section
        id="clients"
        data-beat
        aria-labelledby="clients-title"
        className="relative h-[150svh]"
      >
        <div className={`${frame} items-end pb-24 md:pb-14`}>
          <Scrim />
          <div data-reveal-block className="scene-copy w-full">
            <Eyebrow>Clients</Eyebrow>
            <h2
              id="clients-title"
              data-reveal
              className="text-title font-heading mt-3 font-medium"
            >
              Brands we&apos;ve worked with
            </h2>
            <ul className="tour-logos mt-8">
              {clients.map((client) => {
                const mark = client.logo ? (
                  <Image
                    src={client.logo.src}
                    alt={client.name}
                    width={client.logo.width}
                    height={client.logo.height}
                    style={{ height: client.logo.display, width: "auto" }}
                    sizes={`${Math.ceil((client.logo.display * client.logo.width) / client.logo.height)}px`}
                  />
                ) : (
                  <span className="tour-wordmark">{client.name}</span>
                );
                return (
                  <li key={client.name}>
                    {client.caseStudy ? (
                      <Link
                        href={caseStudyPath({ slug: client.caseStudy })}
                        className="tour-logo-link"
                        data-track={`client-logo-${client.caseStudy}`}
                      >
                        {mark}
                      </Link>
                    ) : (
                      mark
                    )}
                  </li>
                );
              })}
              <li>
                <span className="tour-more">+{moreClients} more</span>
              </li>
            </ul>
            <p className="mt-8">
              <Link href={workPage.path} className="tour-link">
                See all our work
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 8 · Services: the signature offer leads a grid that can grow on phones. */}
      <section id="services" data-beat className="relative h-[165svh]">
        <div className="scene-frame services-frame sticky top-0 flex min-h-svh items-end px-6 pt-24 pb-24 md:items-center md:justify-end md:px-12 md:pt-28 md:pb-14 lg:px-16">
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-xl">
            <h2
              data-reveal
              className="text-title font-heading font-medium text-balance"
            >
              {services.heading}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:mt-7">
              {services.items.map((item, index) => (
                <li
                  key={item.title}
                  className={
                    index === 0
                      ? "col-span-2 border-b border-white/20 pb-5"
                      : ""
                  }
                >
                  <h3
                    className={`font-heading font-medium text-white ${
                      index === 0
                        ? "text-xl/tight md:text-2xl/tight"
                        : "text-base/tight"
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="decoration-violet-soft/60 hover:decoration-violet-soft underline decoration-1 underline-offset-4 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.8125rem]/relaxed font-medium text-white/85 md:text-sm/relaxed">
                    {item.body}
                  </p>
                  <p className="text-violet-soft mt-1.5 text-xs font-bold">
                    {formatPrice(item.price)}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link
                href={servicesPage.path}
                className="tour-link"
                data-cta="compare_services"
              >
                Compare all services
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 9 · About: the BellOps sign on the back wall; the copy sits left,
          over the shaded side of the room. */}
      <section
        id="about"
        data-beat
        aria-labelledby="about-title"
        className="relative h-[165svh]"
      >
        <div
          className={`${frame} scene-frame-side scene-frame-left items-end pb-24 md:items-center md:pb-0`}
        >
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-md">
            <Eyebrow>Delhi-based, working remotely across India</Eyebrow>
            <h2
              id="about-title"
              data-reveal
              className="text-title font-heading mt-3 font-medium"
            >
              {aboutBellops.heading}
            </h2>
            <p className="mt-5 max-w-[46ch] font-medium text-white/90">
              {aboutBellops.body}
            </p>
            <p className="mt-6">
              <Link href={aboutPage.path} className="tour-link">
                More about the studio
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 10 · Questions: across the whole room to the sign. The list is
          taller than a phone screen, so it scrolls with the page instead of
          holding still; a solid shade keeps the answers easy to read. */}
      <section
        id="faq"
        data-beat
        aria-labelledby="faq-title"
        className="relative min-h-[130svh]"
      >
        <div className="scene-frame faq-frame relative flex min-h-[130svh] items-center px-6 pt-28 pb-24 md:px-12 md:pb-20 lg:px-16">
          <Scrim />
          <div data-reveal-block className="scene-copy faq-layout w-full">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2
                id="faq-title"
                data-reveal
                className="text-title font-heading mt-3 font-medium text-balance"
              >
                Frequently asked questions
              </h2>
              <p className="mt-4 max-w-[34ch] font-medium text-white/85">
                Anything else? Ask us on{" "}
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tour-link"
                  data-track="whatsapp-faq"
                >
                  WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </div>
            {/* Word for word the page's FAQPage data (app/page.tsx). */}
            <div className="tour-faq">
              {homeFaqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    <span>{faq.question}</span>
                    <span className="tour-faq-icon" aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11 · Contact: the last shot. The way to reach us sits lower left; the
          form takes the right, over the dark stone wall. The section grows
          with the form, so it never clips on short screens. */}
      <section
        id="contact"
        data-beat
        data-ga-location="contact"
        className="relative min-h-svh"
      >
        <div className="scene-frame contact-frame relative flex min-h-svh flex-col justify-end px-6 pt-28 pb-10 md:px-12 md:pb-14 lg:px-16">
          <Scrim />
          <div data-reveal-block className="scene-copy w-full">
            <div className="contact-layout">
              <div className="contact-intro">
                <h2
                  data-reveal
                  className="text-display font-heading font-medium text-balance"
                >
                  {contact.heading}
                </h2>
                <p className="mt-4 max-w-[44ch] font-medium text-white/90">
                  {contact.body}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-button contact-button--light"
                    data-track="whatsapp-contact"
                  >
                    <WhatsAppIcon />
                    {contact.whatsapp}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
                <p className="mt-5 text-sm font-medium text-white/80">
                  Prefer Instagram? DM “START” to{" "}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour-link"
                    data-track="instagram-dm-start"
                  >
                    @bellops.in
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              </div>
              <EnquiryForm />
            </div>
            <footer
              data-ga-location="footer"
              className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/25 pt-5 text-sm font-medium text-white/85 md:mt-14"
            >
              {/* Not Tailwind's `block`: the inner pages' .block (a section
                  with a rule and deep padding) shares the name. */}
              <div>
                <p>
                  © {site.copyrightYear} {site.name}
                </p>
                <p className="mt-1 text-xs font-normal text-white/60">
                  The studio follows your local time and weather. Weather data
                  from{" "}
                  <a
                    href="https://www.met.no/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    MET Norway
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                <li>
                  <Link href={servicesPage.path} className="hover:text-white">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href={threeDPage.path} className="hover:text-white">
                    3D websites
                  </Link>
                </li>
                <li>
                  <Link href={workPage.path} className="hover:text-white">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href={aboutPage.path} className="hover:text-white">
                    About
                  </Link>
                </li>
                {publishedPosts.length > 0 && (
                  <li>
                    <Link href={blogPage.path} className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                )}
                <li>
                  <Link href={contactPage.path} className="hover:text-white">
                    Contact
                  </Link>
                </li>
                {site.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white"
                      data-track={`social-${social.label.toLowerCase()}`}
                    >
                      {social.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * An invisible stand-in for text the other layer draws: the same element and
 * classes, so it takes up exactly the same space, but its words come from a
 * data attribute through CSS (tour.css). The page's HTML then holds every
 * line of the opening scene once, not once per layer.
 */
function Ghost({
  as: Tag = "span",
  className,
  text,
  children,
}: {
  as?: "p" | "span";
  className?: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      aria-hidden
      data-intro-ghost=""
      data-ghost-text={text}
      className={className}
    >
      {children}
    </Tag>
  );
}

/**
 * One layer of the opening scene. Both layers lay out every part, so they line
 * up exactly at any screen size; each shows its own parts and holds invisible
 * stand-ins (Ghost) for the other's.
 * - "headline": the page's <h1>, large, in white with mix-blend-mode:
 *   difference, so each letter shows the inverse of the sky, clouds or window
 *   frame behind it. The blend has to sit on the layer itself (a sticky
 *   frame is its own stacking context), hence two layers.
 * - "rest": the shade, description and buttons in their usual colors.
 *
 * Screen readers hear the <h1> first (the headline layer comes first), then
 * the description and buttons.
 */
function IntroLayer({ part }: { part: "headline" | "rest" }) {
  const headline = part === "headline";
  return (
    <div
      className={`${frame} intro-frame ${headline ? "intro-frame--headline" : ""}`}
    >
      {!headline && <Scrim />}
      <div className="scene-copy intro-copy">
        {headline ? (
          <h1 className="intro-title font-heading">
            {intro.headingLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h1>
        ) : (
          <p aria-hidden className="intro-title font-heading">
            {intro.headingLines.map((line) => (
              <Ghost key={line} text={line} />
            ))}
          </p>
        )}
        <div
          className="intro-footer"
          {...(headline ? { "aria-hidden": true } : {})}
        >
          {headline ? (
            <Ghost as="p" className="intro-description" text={intro.body} />
          ) : (
            <p className="intro-description">{intro.body}</p>
          )}
          <div className="intro-actions">
            {headline ? (
              <>
                <Ghost className="intro-cta" text={intro.cta} />
                <Ghost
                  className="contact-button contact-button--outline"
                  text={intro.whatsapp}
                >
                  <WhatsAppIcon />
                </Ghost>
                <Ghost className="intro-scroll" text={intro.hint}>
                  <ArrowDownIcon />
                </Ghost>
              </>
            ) : (
              <>
                <GlideLink
                  to="contact"
                  className="intro-cta"
                  data-track="start-project"
                  data-cta="get_quote"
                >
                  {intro.cta}
                </GlideLink>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button contact-button--outline"
                  data-track="whatsapp-intro"
                >
                  <WhatsAppIcon />
                  {intro.whatsapp}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <GlideLink
                  to="work"
                  className="intro-scroll"
                  data-cta="see_work"
                >
                  <span>{intro.hint}</span>
                  <ArrowDownIcon />
                </GlideLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v16m-6-6 6 6 6-6" />
    </svg>
  );
}

function ExternalLink({
  href,
  track,
  children,
}: {
  href: string;
  track?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      data-track={track}
      target="_blank"
      rel="noopener noreferrer"
      className="tour-link"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
