import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { WhatsAppIcon } from "@/components/contact/icons";
import { Arrow } from "@/components/site/Arrow";
import { Capabilities } from "@/components/site/Capabilities";
import { SiteFooter } from "@/components/site/SiteFooter";
import { INSTAGRAM_URL, approach, contact, intro, studio } from "@/lib/content";
import { whatsappHref } from "@/lib/contact-links";
import { caseStudyPath, projects } from "@/lib/work";
import { GlideLink } from "./GlideLink";

const disciplines = [
  "Strategy",
  "Web design",
  "Development",
  "3D & motion",
  "Digital growth",
];
const projectTypes = [
  "Automotive / Digital showroom",
  "Creative / Agency website",
  "Healthcare / Corporate website",
];

/** Eight editorial scenes keep the original studio camera's eight beats. */
export function Chapters() {
  return (
    <>
      <section
        id="intro"
        data-beat
        className="tour-hero"
        data-ga-location="hero"
      >
        <div className="hero-grid" aria-hidden="true" />
        <div className="tour-hero-top">
          <p>
            <span className="status-dot" /> Independent minds. Shared ambition.
          </p>
          <span>Delhi, India · Working everywhere</span>
        </div>
        <div className="tour-hero-body">
          <div className="tour-hero-copy">
            {/* The page's <h1>, in the words people search for, set small
                above the display line. */}
            <h1 className="studio-label hero-intro">{intro.heading}</h1>
            <p className="tour-title">
              <span className="hero-line">
                <span>Built to be</span>
              </span>
              <span className="hero-line">
                <span className="tour-title-accent">remembered.</span>
              </span>
            </p>
            <div className="tour-hero-description hero-intro">
              <p>
                We build websites people feel.
                <br />
                And the strategy that moves them forward.
              </p>
              <div className="tour-hero-actions">
                <GlideLink
                  to="contact"
                  className="studio-button studio-button--violet"
                  data-magnetic
                  data-track="start-project"
                  data-cta="get_quote"
                >
                  Get a quote in 24h <Arrow diagonal />
                </GlideLink>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="studio-button studio-button--outline"
                  data-magnetic
                  data-track="whatsapp-intro"
                >
                  <WhatsAppIcon /> WhatsApp us
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
          <div
            className="hero-composition"
            aria-label="Websites designed and built by BellOps"
          >
            <div className="composition-orbit" aria-hidden="true">
              <span />
              <span />
            </div>
            <Link
              href={caseStudyPath(projects[0]!)}
              className="composition-browser hero-art"
            >
              <span className="browser-bar">
                <i />
                <i />
                <i />
                <span>babaluxurycar.com</span>
                <Arrow diagonal />
              </span>
              <Image
                src={projects[0]!.image}
                alt="Baba Luxury Cars website, designed by BellOps"
                width={1600}
                height={1000}
                sizes="(min-width: 900px) 45vw, 85vw"
                // The home page's LCP on phones and desktops: the one image
                // preloaded at high priority. Everything else waits (lazy).
                preload
              />
            </Link>
            <Link
              href={caseStudyPath(projects[1]!)}
              className="composition-phone hero-art"
            >
              <Image
                src={projects[1]!.mobileImage}
                alt="PUSHWebb mobile website"
                width={390}
                height={845}
                sizes="(min-width: 900px) 12vw, 26vw"
              />
            </Link>
            <div className="composition-note hero-art">
              <span className="note-star" aria-hidden="true">
                ✳
              </span>
              <p>
                Good-looking.
                <br />
                Hard-working.
              </p>
              <span>That&apos;s the standard.</span>
            </div>
            <span className="composition-caption">
              Real projects. Thoughtfully built.
            </span>
          </div>
        </div>
        <div className="tour-hero-bottom">
          <a
            href="#studio"
            className="scroll-invitation"
            data-cta="explore_studio"
          >
            <span className="scroll-circle">
              <Arrow />
            </span>
            <span>
              Take a closer look<span>Scroll to explore</span>
            </span>
          </a>
          <p>
            Premium website design & digital marketing
            <br />
            <span>One independent studio. Every detail connected.</span>
          </p>
          <span className="hero-edition">
            BELL / OPS
            <br />
            EST. IN DELHI
          </span>
        </div>
      </section>
      <section id="studio" data-beat className="studio-story paper-section">
        <div
          className="studio-ticker"
          aria-label="Strategy, web design, development, 3D and motion, digital growth"
        >
          <div className="ticker-track" aria-hidden="true">
            {[0, 1].map((copy) => (
              <div key={copy} className="ticker-group">
                {disciplines.map((item) => (
                  <span key={item}>
                    {item}
                    <i>✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="studio-wrap story-grid">
          <div className="story-images" data-enter>
            <div className="story-main-photo" data-photo>
              <Image
                src="/navigation/services-v1/premium-websites.webp"
                alt="A website taking shape from a sketched wireframe to a finished design"
                width={960}
                height={600}
                sizes="(min-width: 900px) 40vw, 90vw"
              />
            </div>
            <div className="story-detail-photo" data-photo>
              <Image
                src="/navigation/services-v1/branding.webp"
                alt="Pencil explorations, colour swatches and printed identity samples"
                width={960}
                height={600}
                sizes="(min-width: 900px) 24vw, 50vw"
              />
            </div>
            <span className="story-caption">
              <span>01 / THE STUDIO</span>
              <span>A little curiosity goes a long way.</span>
            </span>
          </div>
          <div className="story-copy">
            <p className="studio-label" data-enter>
              Small team. Whole picture.
            </p>
            <h2 className="editorial-title" data-enter>
              A bigger
              <br />
              point of <em>view.</em>
            </h2>
            <p
              className="story-manifesto"
              aria-label="We connect how your brand looks, how your website works, and how your business grows."
            >
              {"We connect how your brand looks, how your website works, and how your business grows."
                .split(" ")
                .map((word, index) => (
                  <span className="manifesto-word" key={index}>
                    {word}{" "}
                  </span>
                ))}
            </p>
            <p className="story-body" data-enter>
              {studio.body}
            </p>
            <Link href="/services" className="studio-text-link" data-enter>
              Meet your next creative partner <Arrow diagonal />
            </Link>
          </div>
        </div>
      </section>
      <section id="approach" data-beat className="studio-approach">
        <div className="studio-wrap">
          <div className="section-topline" data-enter>
            <span className="studio-label">
              02 / A little method to the magic
            </span>
            <span>Clarity first. Every time.</span>
          </div>
          <div className="approach-grid">
            <div className="approach-art" aria-hidden="true">
              <div className="method-orbit">
                <span />
                <span />
                <span />
                <i>✳</i>
              </div>
              <p>
                Different disciplines.
                <br />
                One direction.
              </p>
            </div>
            <div className="approach-copy">
              <h2 className="editorial-title" data-enter>
                Think.
                <br />
                Make.
                <br />
                <em>Move.</em>
              </h2>
              <ol>
                {approach.points.map((point, index) => (
                  <li key={point.title} data-enter>
                    <span>0{index + 1}</span>
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
      {projects.map((project, index) => (
        <section
          key={project.slug}
          id={index === 0 ? "work" : undefined}
          data-beat
          className={"tour-project project-tone-" + index}
          aria-labelledby={"project-title-" + index}
        >
          <div className="studio-wrap project-sticky">
            <div className="section-topline" data-enter>
              <span className="studio-label">
                {index === 0
                  ? "03 / A few things we put into the world"
                  : "Selected work / Continued"}
              </span>
              <span>
                0{index + 1} / 0{projects.length}
              </span>
            </div>
            <div className="project-heading" data-enter>
              <h2 id={"project-title-" + index}>{project.client}</h2>
              <span>{projectTypes[index]}</span>
            </div>
            <Link
              href={caseStudyPath(project)}
              className="project-canvas"
              aria-label={"Explore " + project.client + " case study"}
            >
              <span className="project-watermark" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="project-browser" data-project-image>
                <div className="browser-bar">
                  <i />
                  <i />
                  <i />
                  <span>
                    {new URL(project.url).hostname.replace("www.", "")}
                  </span>
                  <Arrow diagonal />
                </div>
                <Image
                  src={project.image}
                  alt={project.client + " desktop website"}
                  width={1600}
                  height={1000}
                  sizes="(min-width: 900px) 68vw, 88vw"
                />
              </div>
              <div className="project-phone" data-project-phone>
                <Image
                  src={project.mobileImage}
                  alt={project.client + " mobile website"}
                  width={390}
                  height={845}
                  sizes="(min-width: 900px) 15vw, 24vw"
                />
              </div>
              <span className="project-explore" aria-hidden="true">
                <Arrow diagonal />
              </span>
            </Link>
            <div className="project-bottom">
              <p>{project.title}</p>
              <Link href={caseStudyPath(project)} className="studio-text-link">
                Explore the project <Arrow diagonal />
              </Link>
            </div>
          </div>
        </section>
      ))}
      <section
        id="services"
        data-beat
        className="tour-capabilities paper-section"
      >
        <div className="studio-wrap">
          <div className="section-topline" data-enter>
            <span className="studio-label">
              04 / What we bring to the table
            </span>
            <Link href="/services" className="studio-text-link">
              All services <Arrow diagonal />
            </Link>
          </div>
          <div className="capabilities-heading" data-enter>
            <h2 className="editorial-title">
              All the right
              <br />
              <em>connections.</em>
            </h2>
            <p>
              A considered identity. A website with a point of view. A plan for
              what comes next.
            </p>
          </div>
          <Capabilities />
        </div>
      </section>
      <section
        id="contact"
        data-beat
        className="tour-contact"
        data-ga-location="contact"
      >
        <div className="studio-wrap">
          <div className="section-topline" data-enter>
            <span className="studio-label">
              05 / Your next chapter starts here
            </span>
            <span className="contact-location">
              <span className="status-dot" /> Based in Delhi. Open to ideas.
            </span>
          </div>
          <h2 className="contact-display" data-enter>
            Something good
            <br />
            starts with <em>hello.</em>
            <span aria-hidden="true">↗</span>
          </h2>
          <div className="contact-layout">
            <div className="contact-intro" data-enter>
              <h3>{contact.heading}</h3>
              <p>{contact.body}</p>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-button studio-button--cream"
                data-track="whatsapp-contact"
                data-magnetic
              >
                <WhatsAppIcon /> Let&apos;s talk on WhatsApp <Arrow diagonal />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="instagram-invitation">
                Prefer Instagram? DM “START” to{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="instagram-dm-start"
                >
                  @bellops.in
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
              <div className="contact-monogram" aria-hidden="true">
                b<span>o.</span>
                <i>
                  GOOD DESIGN.
                  <br />
                  REAL CONNECTION.
                </i>
              </div>
            </div>
            <div className="contact-form-wrap" data-enter>
              <p className="studio-label">Tell us a little about it.</p>
              <EnquiryForm />
            </div>
          </div>
        </div>
        <SiteFooter />
        <p className="weather-credit">
          The studio scene follows your local time and weather. Weather data
          from{" "}
          <a
            href="https://www.met.no/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            MET Norway<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </section>
    </>
  );
}
