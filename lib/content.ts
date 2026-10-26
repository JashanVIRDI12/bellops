/**
 * Copy for the home page. Edit words here rather than in the components.
 * Items marked PLACEHOLDER need real details before launch.
 */

export const INSTAGRAM_URL = "https://www.instagram.com/bellops.in/";

export const site = {
  name: "Bellops",
  // The search-result snippet and share-card text. Keep it under ~160 characters.
  description:
    "Delhi-based, working remotely across India, Bellops builds premium, fast 3D websites with Three.js and WebGL, plus landing pages, ads and SEO.",
  // WhatsApp is the only direct contact for now (no call or email buttons).
  // With the country code; spaces are fine.
  whatsapp: "+91 85868 75703",
  // Typed into every WhatsApp link (the visitor can edit it before sending),
  // except on service pages, which use services.whatsappMessage.
  whatsappQuote: "Hi Bellops, I'd like a quote for my project.",
  copyrightYear: 2026, // static on purpose: the page is prerendered, so no new Date()
  socials: [{ label: "Instagram", href: INSTAGRAM_URL }],
  // Who runs the studio: named on the home and about pages, and in the
  // structured data.
  founders: ["Jashan Singh", "Shivam Ahuja"],
  // Where the studio is registered, for search engines (structured data).
  // Bellops works remotely, so no street or neighbourhood is published.
  address: { region: "Delhi", country: "IN" },
};

/**
 * The tour, in order. Each chapter owns one or more camera beats (shots in
 * components/experience/scene/shots.ts); `beats` must add up to the shot count.
 */
export const chapters = [
  { id: "intro", label: "Intro", beats: 1 },
  { id: "studio", label: "Studio", beats: 1 },
  { id: "approach", label: "Approach", beats: 1 },
  { id: "three-d", label: "3D websites", beats: 1 },
  { id: "work", label: "Work", beats: 3 },
  { id: "clients", label: "Clients", beats: 1 },
  { id: "services", label: "Services", beats: 1 },
  { id: "about", label: "About", beats: 1 },
  { id: "faq", label: "FAQ", beats: 1 },
  { id: "contact", label: "Contact", beats: 1 },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/**
 * The camera shot (and still) number of a chapter's beat: shot("work", 2) is
 * the third project. Inner pages pick their hero's shot this way, so adding
 * a chapter never points them at the wrong one.
 */
export function shot(id: ChapterId, beat = 0) {
  let start = 0;
  for (const chapter of chapters) {
    if (chapter.id === id) return start + Math.min(beat, chapter.beats - 1);
    start += chapter.beats;
  }
  return 0;
}

export const intro = {
  // The page's one headline: the <h1>, in the words people search for, set
  // large over the view out of the window. One entry per line (wide screens
  // keep these breaks; phones may wrap them).
  headingLines: ["3D website design", "agency in India,", "built to perform"],
  body: "We design and code premium, interactive websites in-house, from immersive Three.js and WebGL scenes to fast landing pages. Then we grow them with Google and Meta ads, social media and SEO. One small studio, Delhi-based, working remotely across India.",
  cta: "Get a quote for your website",
  whatsapp: "Chat on WhatsApp",
  hint: "See our work",
};

export const studio = {
  heading: "Premium website design and marketing, under one roof",
  body: "Bellops is an independent studio for brands that care how they feel, not only how they look. One small team handles strategy, design, development, ads and social media, so your website and your marketing pull in the same direction.",
};

export const approach = {
  heading: "Built to rank, load fast and convert.",
  points: [
    {
      title: "Fast on every device",
      body: "Technical SEO and Core Web Vitals are built in, and every 3D scene ships with a lighter version for slower phones.",
    },
    {
      title: "Strategy first",
      body: "Every page is planned around your customers and what they search for, before anything is designed.",
    },
    {
      title: "Designed and built in-house",
      body: "The people who design your site write the code too. Nothing gets lost in a handoff.",
    },
  ],
};

/**
 * The services. Titles also label the enquiry form's checkboxes and are saved
 * with each enquiry, so keep them short and stable.
 *
 * Each service has its own page (`page`): the copy there is drawn from these
 * descriptions and the studio's own wording. No prices, timelines or results
 * until Bellops supplies them. `hour` picks the studio still that opens the
 * page: a camera shot (0-7, see scene/shots.ts) at a time of day.
 */
/** A studio still: a camera shot (0-7) at a time of day, optionally another for phones. */
export type Hour = {
  shot: number;
  mood: "day" | "dusk" | "night";
  /** Phones, where the portrait framing of another shot reads better. */
  portrait?: { shot: number; mood: "day" | "dusk" | "night" };
};

/** A starting price: "From ₹15,000/month + ad spend". */
export type Price = { from: number; per?: "month"; extra?: string };

export type Service = {
  title: string;
  body: string;
  /** The service page's address. */
  href: string;
  /** Short name for menus. */
  nav: string;
  /** Decorative image shown when this service is hovered or focused. */
  navImage: string;
  /**
   * The starting price on its card and page. Premium websites (₹50,000) and
   * landing pages (₹20,000) are Bellops' own; the rest were set in October
   * 2026 from Indian agency rates, at the entry end. Change them freely.
   */
  price: Price;
  page: {
    title: string;
    description: string;
    heading: string;
    lead: string;
    included: readonly string[];
    hour: Hour;
    /** Other services worth a look from here (their hrefs). */
    related: readonly string[];
    /**
     * The page's answer to "What does it cost?". {price} is filled from
     * `price` (₹50,000, ₹15,000/month), so it always matches the hero.
     */
    priceAnswer: string;
  };
};

export const services = {
  // Typed into the WhatsApp links on a service's page and its card on
  // /services: {service} is its title, {price} its starting price.
  whatsappMessage: "Hi Bellops, I'd like a quote for {service} ({price}).",
  heading: "Interactive websites, and everything that brings people to them",
  items: [
    {
      title: "Premium & 3D website design",
      body: "Custom design and development with immersive Three.js and WebGL 3D, smooth motion and a premium finish, without slowing the site down.",
      href: "/premium-website-design",
      nav: "Premium websites",
      navImage: "/navigation/services-v1/premium-websites.webp",
      price: { from: 50_000 },
      page: {
        title: "Premium & Luxury Website Design Company in India | Bellops",
        description:
          "Custom premium and luxury website design in India by Bellops: planned around your customers, designed and built in-house, with immersive 3D and smooth motion.",
        heading: "Premium Website Design for Brands That Want to Stand Out",
        lead: "Custom website design and development with immersive 3D, smooth motion and a premium finish, for brands that care how they feel, not only how they look.",
        included: [
          "A custom design, made for your brand",
          "Immersive 3D and smooth motion",
          "Designed and built by the same team",
          "Technical SEO and Core Web Vitals built in",
          "A lighter version of every 3D scene for slower phones",
        ],
        hour: { shot: shot("work", 2), mood: "dusk" },
        related: ["/landing-pages", "/seo-services", "/website-care-plans"],
        priceAnswer:
          "Premium websites start from {price}. The final price depends on scope, and you'll get a fixed quote once we understand the project.",
      },
    },
    {
      title: "Landing pages",
      body: "High-converting landing pages for ad campaigns, product launches and lead generation.",
      href: "/landing-pages",
      nav: "Landing pages",
      navImage: "/navigation/services-v1/landing-pages.webp",
      price: { from: 20_000 },
      page: {
        title: "Landing Page Design Agency in India for Ads | Bellops",
        description:
          "High-converting landing pages for Google and Meta ad campaigns, product launches and lead generation, designed and built in-house by Bellops in India.",
        heading: "High-Converting Landing Pages for Google & Meta Ads",
        lead: "High-converting landing pages for ad campaigns, product launches and lead generation, built to load fast and turn clicks into enquiries.",
        included: [
          "Pages for Google and Meta ad campaigns",
          "Product launch pages",
          "Lead generation forms",
          "Fast on every device",
          "Technical SEO built in",
        ],
        hour: { shot: shot("work", 1), mood: "day" },
        related: [
          "/google-meta-ads",
          "/premium-website-design",
          "/seo-services",
        ],
        priceAnswer:
          "Landing pages start from {price}. The final price depends on scope, and you'll get a fixed quote once we understand the project.",
      },
    },
    {
      title: "Google & Meta ad campaigns",
      body: "Google, Instagram and Facebook ads, with the creative and targeting to turn clicks into customers, sent to pages we built to convert.",
      href: "/google-meta-ads",
      nav: "Google & Meta ads",
      navImage: "/navigation/services-v1/google-meta-ads.webp",
      price: { from: 15_000, per: "month", extra: "ad spend" },
      page: {
        title: "Google & Meta Ads Agency in India | Bellops",
        description:
          "Google, Instagram and Facebook ad campaigns by Bellops in India, with the creative and targeting to turn clicks into customers, and landing pages to match.",
        heading: "Google & Meta Ads That Turn Clicks into Customers",
        lead: "Google, Instagram and Facebook ads with the creative and targeting to turn clicks into customers, from the studio that builds the pages they land on.",
        included: [
          "Google ads",
          "Instagram and Facebook ads",
          "Ad creative, designed in-house",
          "Audience targeting",
          "Landing pages to match each campaign",
        ],
        hour: { shot: shot("studio"), mood: "day" },
        related: [
          "/landing-pages",
          "/social-media-management",
          "/seo-services",
        ],
        priceAnswer:
          "Ad management starts from {price}, plus your ad spend. Tell us your goals and we'll send a fixed quote.",
      },
    },
    {
      title: "Social media management",
      body: "Content planning, post and reel design, and scheduling that keep your Instagram consistent.",
      href: "/social-media-management",
      nav: "Social media",
      navImage: "/navigation/services-v1/social-media.webp",
      price: { from: 15_000, per: "month" },
      page: {
        title: "Social Media Management Agency in India | Bellops",
        description:
          "Social media management by Bellops in India: content planning, post and reel design, and scheduling that keep your Instagram consistent.",
        heading: "Social Media Management That Keeps Your Brand Consistent",
        lead: "Content planning, post and reel design, and scheduling that keep your Instagram consistent, made by the team that designs your brand and website.",
        included: [
          "Content planning",
          "Post design",
          "Reel design",
          "Scheduling",
          "A consistent look across your Instagram",
        ],
        hour: { shot: shot("approach"), mood: "day" },
        related: ["/branding", "/google-meta-ads", "/premium-website-design"],
        priceAnswer:
          "Social media management starts from {price}. Tell us your goals and we'll send a fixed quote.",
      },
    },
    {
      title: "SEO & speed optimization",
      body: "Technical, on-page and local SEO, plus faster load times, so customers find you on Google and stay.",
      href: "/seo-services",
      nav: "SEO & speed",
      navImage: "/navigation/services-v1/seo-speed.webp",
      price: { from: 12_000, per: "month" },
      page: {
        title: "SEO & Website Speed Optimization Services in India | Bellops",
        description:
          "Technical, on-page and local SEO by Bellops in India, plus faster load times and Core Web Vitals, so customers find you on Google.",
        heading: "SEO and Speed Optimization So Customers Find You on Google",
        lead: "Technical, on-page and local SEO, plus faster load times, so customers find you on Google, and a site that stays quick once they arrive.",
        included: [
          "Technical SEO",
          "On-page SEO",
          "Local SEO",
          "Faster load times",
          "Core Web Vitals",
        ],
        hour: { shot: shot("services"), mood: "day" },
        related: [
          "/premium-website-design",
          "/landing-pages",
          "/website-care-plans",
        ],
        priceAnswer:
          "SEO and speed optimization starts from {price}. Tell us your goals and we'll send a fixed quote.",
      },
    },
    {
      title: "Website care plans",
      body: "Hosting, security updates, backups and small edits, handled every month.",
      href: "/website-care-plans",
      nav: "Website care",
      navImage: "/navigation/services-v1/website-care.webp",
      price: { from: 3_000, per: "month" },
      page: {
        title: "Website Maintenance & Care Plans in India | Bellops",
        description:
          "Website care plans by Bellops in India: hosting, security updates, backups and small edits, every month, so your site stays fast, safe and current.",
        heading: "Website Care Plans: Hosting, Security, Backups and Edits",
        lead: "Website maintenance every month: hosting, security updates, backups and small edits, so your site stays fast, safe and up to date.",
        included: [
          "Hosting",
          "Security updates",
          "Backups",
          "Small edits, every month",
        ],
        hour: { shot: shot("approach"), mood: "night" },
        related: ["/seo-services", "/premium-website-design", "/landing-pages"],
        priceAnswer:
          "Website care plans start from {price}. Tell us about your site and we'll send a fixed quote.",
      },
    },
    {
      title: "Branding starter packs",
      body: "Logo design, colour palette and a social media kit for a consistent brand identity.",
      href: "/branding",
      nav: "Branding",
      navImage: "/navigation/services-v1/branding.webp",
      price: { from: 15_000 },
      page: {
        title: "Branding Starter Packs: Logo & Brand Identity Design | Bellops",
        description:
          "Branding starter packs by Bellops in India: logo design, a colour palette and a social media kit, for a brand that looks the same everywhere it appears.",
        heading: "Branding Starter Packs for a Consistent Brand",
        lead: "Logo design, a colour palette and a social media kit, so your brand looks the same on your website, your posts and your ads.",
        included: [
          "Logo design",
          "Colour palette",
          "Social media kit",
          "A consistent brand identity",
        ],
        // Phones see the lit BellOps sign; wide screens the corner at dusk.
        hour: {
          shot: shot("contact"),
          mood: "dusk",
          portrait: { shot: shot("work"), mood: "night" },
        },
        related: [
          "/social-media-management",
          "/premium-website-design",
          "/google-meta-ads",
        ],
        priceAnswer:
          "Branding starter packs start from {price}. Tell us what you need and we'll send a fixed quote.",
      },
    },
  ] satisfies readonly Service[],
};

/** The services overview page. */
export const servicesPage = {
  path: "/services",
  title: "Web Design & Digital Marketing Services in India | Bellops",
  description:
    "Premium 3D websites, landing pages, Google and Meta ads, social media, SEO, website care and branding from Bellops: Delhi-based, working remotely across India.",
  heading: "Everything your brand needs online, from one studio",
  lead: "Strategy, design, development, ads and social media, from one small team: Delhi-based, working remotely across India.",
  hour: { shot: shot("studio"), mood: "dusk" } as Hour,
  // "What does it cost?" here: {care} and {premium} are those services' prices.
  priceAnswer:
    "Prices start from {care} for website care and {premium} for a premium website. Each service above shows its starting price, and every quote is fixed once we understand the project.",
};

/**
 * How a project runs. A sequence, so the steps are numbered on the pages.
 * Drawn from the approach above.
 */
export const projectProcess = {
  heading: "How a project runs",
  steps: [
    {
      title: "Plan",
      body: "We start with your customers and what they search for, before anything is designed.",
    },
    {
      title: "Design",
      body: "We design around that plan, in the same small team that will build it.",
    },
    {
      title: "Build",
      body: "The people who design your work make it too, so nothing gets lost in handoff.",
    },
    {
      title: "Launch and grow",
      body: "We launch, then grow it with Google and Meta ads, social media management and SEO.",
    },
  ],
};

/** Questions on the service pages. Every answer comes from what Bellops has said. */
/** Asked last on every service page, answered with its prices (lib/services.ts). */
export const COST_QUESTION = "What does it cost?";

export const faqs = [
  {
    question: "Where are you based?",
    answer: "We're Delhi-based, working remotely across India.",
  },
  {
    question: "How do we get started?",
    answer:
      "Send an enquiry or message us on WhatsApp with what you need and when you want to launch. We usually reply within a working day.",
  },
  {
    question: "Can one team handle the website, ads and social media?",
    answer:
      "Yes. Strategy, design, development, ads and social media all come from one small team, so nothing gets lost between agencies.",
  },
];

export const contact = {
  heading: "Tell us what you're building",
  body: "Share your goals, budget range and launch date. We usually reply within a working day.",
  whatsapp: "Chat on WhatsApp",
};

/** The work index and case studies. */
export const workPage = {
  path: "/work",
  title: "Selected Work: Websites Designed & Built by Bellops",
  description:
    "Websites Bellops has designed and built: a showroom for luxury cars in Delhi, a home for a creative agency and an export site for a healthcare manufacturer.",
  heading: "Selected work",
  lead: "Websites we've designed and built, from first sketch to launch.",
  // A case study's WhatsApp links type this in; {name} is the client.
  whatsappMessage:
    "Hi Bellops, I saw the {name} case study and want something similar.",
};

/**
 * The about and contact pages, built from the studio's existing words (the
 * studio, approach and contact copy above). The founder's story waits for
 * Jashan's bio.
 */
export const aboutPage = {
  path: "/about",
  title: "About Bellops: Delhi-Based Web Design Studio",
  description:
    "Bellops is an independent web design and digital marketing studio, Delhi-based, working remotely across India: design, code, ads and social, one small team.",
  // The BellOps sign on the studio wall.
  hour: { shot: shot("about"), mood: "dusk" } as Hour,
};

export const contactPage = {
  path: "/contact",
  title: "Contact Bellops: Delhi-Based Web Design & Marketing Studio",
  description:
    "Tell Bellops about your website, ad campaign or social media goals. Send an enquiry or chat on WhatsApp; we usually reply within a working day.",
  hour: { shot: shot("faq"), mood: "night" } as Hour,
};

/** The cookie notice shown once per browser, until the visitor presses OK. */
export const cookieNotice = {
  text: "We use cookies and similar storage to remember your choices and see how the site is used.",
  accept: "OK",
};

/** The enquiry form in the contact section. Enquiries arrive in /admin. */
export const enquiryForm = {
  label: "Send us an enquiry",
  name: "Name",
  email: "Email",
  phone: "Phone or WhatsApp",
  contactHint: "We need an email or a phone number to reply.",
  services: "What do you need?",
  budget: "Budget",
  budgetPlaceholder: "Choose a range",
  // Edit freely: enquiries store the chosen text.
  budgets: [
    "Under ₹50,000",
    "₹50,000 – ₹1.5 lakh",
    "₹1.5 – 5 lakh",
    "Above ₹5 lakh",
    "Not sure yet",
  ],
  message: "About the project",
  // Optional. Each chip types its text into the message in one tap.
  quickLabel: "Start the message with",
  quickMessages: [
    { label: "New website", text: "I'd like a new website." },
    { label: "Redesign", text: "I'd like to redesign my current website." },
    { label: "Ads", text: "I'd like help with Google or Meta ads." },
  ],
  messagePlaceholder: "What you're building, your timeline, any links.",
  privacy: "We use these details to reply to your enquiry.",
  submit: "Send my enquiry",
  pending: "Sending…",
  // Both end with a WhatsApp link.
  failed: "Your enquiry didn't send. Try again, or message us on",
  busy: "That's a lot of enquiries from one connection. Wait a few minutes, or message us on",
  sentHeading: "Enquiry sent.",
  sentBody:
    "We'll reply within a working day. If it's urgent, message us on WhatsApp.",
  sendAnother: "Send another enquiry",
};
