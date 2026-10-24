import type { ReactNode } from "react";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { WhatsAppIcon } from "@/components/contact/icons";
import {
  approach,
  contact,
  intro,
  services,
  site,
  studio,
} from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { projects } from "@/lib/work";
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

function Scrim() {
  return <div aria-hidden data-scrim className="scene-scrim" />;
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

      {/* 3–5 · Work: over the dark desk, bottom left; the laptop shows the site. */}
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
              <p className="text-violet-soft text-sm font-bold">
                Selected work, {index + 1} of {projects.length}
              </p>
              <h2
                data-reveal
                className="text-title font-heading mt-3 font-medium"
              >
                {project.client}
              </h2>
              <p className="mt-3 max-w-[42ch] font-medium text-white/90">
                {project.title}
              </p>
              <p className="mt-5">
                <ExternalLink
                  href={project.url}
                  track={`project-${project.slug}`}
                >
                  Visit {new URL(project.url).hostname.replace(/^www\./, "")}
                </ExternalLink>
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* 6 · Services: the signature offer leads a grid that can grow on phones. */}
      <section id="services" data-beat className="relative h-[165svh]">
        <div className="scene-frame services-frame sticky top-0 flex min-h-svh items-end px-6 pt-24 pb-24 md:items-center md:justify-end md:px-12 md:pt-28 md:pb-14 lg:px-16">
          <Scrim />
          <div data-reveal-block className="scene-copy w-full max-w-xl">
            <h2 data-reveal className="text-title font-heading font-medium">
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
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.8125rem]/relaxed font-medium text-white/85 md:text-sm/relaxed">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 · Contact: the last shot. The way to reach us sits lower left; the
          form takes the right, over the dark stone wall. The section grows
          with the form, so it never clips on short screens. */}
      <section id="contact" data-beat className="relative min-h-svh">
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
              </div>
              <EnquiryForm />
            </div>
            <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/25 pt-5 text-sm font-medium text-white/85 md:mt-14">
              <p>
                © {site.copyrightYear} {site.name}
                <span className="mt-1 block text-xs font-normal text-white/60">
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
                </span>
              </p>
              <ul className="flex gap-6">
                {site.socials.map((social) => (
                  <li key={social.label}>
                    <ExternalLink
                      href={social.href}
                      track={`social-${social.label.toLowerCase()}`}
                    >
                      {social.label}
                    </ExternalLink>
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

/** Marks the invisible copies that hold another layer's space. */
const ghost = { "aria-hidden": true, "data-intro-ghost": "" } as const;

/**
 * One layer of the opening scene. Both layers lay out every part, so they line
 * up exactly at any screen size; each shows its own parts and keeps invisible
 * copies of the others (hidden from screen readers, with no links).
 * - "headline": the large tagline in white with mix-blend-mode: difference, so
 *   each letter shows the inverse of the sky, clouds or window frame behind it.
 * - "rest": the shade, the <h1>, description and buttons in their usual colors.
 *
 * Screen readers hear the "rest" layer in order: the <h1>, then the tagline
 * (a visually hidden copy, since the visible one is drawn by the other
 * layer), then the description and buttons.
 */
function IntroLayer({ part }: { part: "headline" | "rest" }) {
  const headline = part === "headline";
  const lines = intro.taglineLines.map((line) => (
    <span key={line}>{line} </span>
  ));
  return (
    <div
      className={`${frame} intro-frame ${headline ? "intro-frame--headline" : ""}`}
    >
      {!headline && <Scrim />}
      <div className="scene-copy intro-copy">
        {headline ? (
          <p className="intro-eyebrow" {...ghost}>
            {intro.heading}
          </p>
        ) : (
          <h1 className="intro-eyebrow">{intro.heading}</h1>
        )}
        {headline ? (
          <p aria-hidden className="intro-title font-heading">
            {lines}
          </p>
        ) : (
          <>
            <p className="intro-title font-heading" {...ghost}>
              {lines}
            </p>
            <p className="sr-only">{intro.taglineLines.join(" ")}</p>
          </>
        )}
        <div className="intro-footer" {...(headline ? ghost : {})}>
          <p className="intro-description">{intro.body}</p>
          <div className="intro-actions">
            {headline ? (
              <>
                <span className="intro-cta">{intro.cta}</span>
                <span className="contact-button contact-button--outline">
                  <WhatsAppIcon />
                  {intro.whatsapp}
                </span>
                <span className="intro-scroll">
                  <span>{intro.hint}</span>
                  <ArrowDownIcon />
                </span>
              </>
            ) : (
              <>
                <GlideLink
                  to="contact"
                  className="intro-cta"
                  data-track="start-project"
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
                <a href="#studio" className="intro-scroll">
                  <span>{intro.hint}</span>
                  <ArrowDownIcon />
                </a>
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
      className="text-violet-soft font-bold underline decoration-2 underline-offset-4 transition-colors hover:text-white"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
