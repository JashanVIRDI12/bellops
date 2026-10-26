import { services, site } from "./content";
import { formatInr } from "./pricing";
import { threeDRates } from "./three-d";
import { projects } from "./work";

/*
 * Home page copy from the approved rewrite (homepage-rewrite.md, October
 * 2026): the About block, the line above the work, and the FAQs (also the
 * page's FAQPage data, so the two always match). Prices and timelines come
 * from the same data as the service cards and the 3D page.
 */

const priceOf = (href: string) =>
  formatInr(services.items.find((item) => item.href === href)!.price.from);
const full3d = threeDRates.find((row) => row.name === "Full 3D website")!;

const names = (list: readonly string[]) =>
  list.length > 1
    ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`
    : (list[0] ?? "");

export const aboutBellops = {
  heading: "About Bellops",
  body: `Bellops is an independent web design studio run by ${names(site.founders)}: Delhi-based, working remotely across India. We are a small team that plans, designs and codes every site ourselves, from premium brochure sites to interactive 3D experiences built with Three.js and WebGL. Recent work includes ${names(projects.map((project) => project.client))}.`,
};

export const workIntro =
  "Selected work: a Delhi luxury car showroom, a creative agency and a WHO-GMP healthcare exporter.";

export const homeFaqs = [
  {
    question: "What does a 3D website design agency do?",
    answer:
      "We design and build websites with interactive 3D scenes, motion and real-time graphics, using Three.js and WebGL. At Bellops the same team designs and codes the site, so the 3D fits your brand and still loads fast.",
  },
  {
    question: "Will 3D slow my website down?",
    answer:
      "It shouldn't. We build in technical SEO and Core Web Vitals from the start, and every 3D scene has a lighter version for slower phones.",
  },
  {
    question: "How much does a premium website cost in India?",
    answer: `It depends on scope. Premium websites start from ${priceOf("/premium-website-design")} and landing pages from ${priceOf("/landing-pages")}; a full 3D website costs ${full3d.price}. Share your goals and we'll send a fixed quote.`,
  },
  {
    question: "How long does a website take?",
    answer:
      "Most projects take 2 weeks to a month, depending on scope. A landing page or a one-page 3D site is usually ready in about 2 weeks; a full 3D website takes about a month.",
  },
  {
    question: "Do you only build websites?",
    answer:
      "No. We also run Google and Meta ads, manage social media, handle SEO and speed, offer monthly website care, and create branding starter packs.",
  },
  {
    question: "Do you work with clients outside Delhi?",
    answer: "Yes. We're Delhi-based, working remotely across India.",
  },
  {
    question: "Do you maintain the website after launch?",
    answer:
      "Yes. Our website care plans cover hosting, security updates, backups and small edits every month.",
  },
  {
    question: "How do I get started?",
    answer:
      "Fill in the enquiry form or message us on WhatsApp. We usually reply within a working day.",
  },
];
