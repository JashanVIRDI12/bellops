/**
 * Copy for the home page. Edit words here rather than in the components.
 * Items marked PLACEHOLDER need real details before launch.
 */

export const site = {
  name: "Bellops",
  // The search-result snippet and share-card text. Keep it under ~160 characters.
  description:
    "Bellops builds premium 3D websites, high-converting landing pages, and runs Google & Meta ads and SEO for brands across India. See our work and get a quote.",
  // WhatsApp is the only direct contact for now (no call or email buttons).
  // With the country code; spaces are fine.
  whatsapp: "+91 85868 75703",
  whatsappGreeting: "Hi Bellops, I'd like to talk about a project.", // typed for the visitor, editable before sending
  copyrightYear: 2026, // static on purpose: the page is prerendered, so no new Date()
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/bellops.ai/" },
  ],
  // Where the studio is, for search engines (structured data). Add the street
  // and PIN code here if they should be public.
  address: { locality: "Moti Nagar", region: "Delhi", country: "IN" },
};

/**
 * The tour, in order. Each chapter owns one or more camera beats (shots in
 * components/experience/scene/shots.ts); `beats` must add up to the shot count.
 */
export const chapters = [
  { id: "intro", label: "Intro", beats: 1 },
  { id: "studio", label: "Studio", beats: 1 },
  { id: "approach", label: "Approach", beats: 1 },
  { id: "work", label: "Work", beats: 3 },
  { id: "services", label: "Services", beats: 1 },
  { id: "contact", label: "Contact", beats: 1 },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

export const intro = {
  // The page's <h1>, in the words people search for. It sits small, above
  // the large tagline.
  heading: "Premium 3D Website Design Agency in India",
  // The large display tagline under it, one entry per line (wide screens keep
  // these breaks). Keep each line to about 11 characters so four lines fit the window.
  taglineLines: ["Web design,", "3D, ads", "and social.", "One studio."],
  body: "We design and build fast, premium websites with immersive 3D, then grow them with Google and Meta ads, social media management and SEO.",
  cta: "Start a project",
  whatsapp: "WhatsApp us",
  hint: "Explore the studio",
};

export const studio = {
  heading: "Web design and marketing under one roof.",
  body: "Bellops is an independent studio for brands that care how they feel, not only how they look. Strategy, design, development, ads and social media, from one small team.",
};

export const approach = {
  heading: "Built to rank, load fast and convert.",
  points: [
    {
      title: "Strategy first",
      body: "We plan every page around your customers and what they search for, before anything is designed.",
    },
    {
      title: "Designed and built in-house",
      body: "The people who design your website code it too, so nothing gets lost in handoff.",
    },
    {
      title: "Fast on every device",
      body: "Technical SEO and Core Web Vitals are built in, and every 3D scene has a lighter version for slower phones.",
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

export type Service = {
  title: string;
  body: string;
  /** The service page's address. */
  href: string;
  /** Short name for menus. */
  nav: string;
  page: {
    title: string;
    description: string;
    heading: string;
    lead: string;
    included: readonly string[];
    hour: Hour;
    /** Other services worth a look from here (their hrefs). */
    related: readonly string[];
  };
};

export const services = {
  heading: "Websites, ads, social and SEO.",
  items: [
    {
      title: "Premium & 3D website design",
      body: "Custom website design and development with immersive 3D, smooth motion and a premium finish.",
      href: "/premium-website-design",
      nav: "Premium websites",
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
        hour: { shot: 5, mood: "dusk" },
        related: ["/landing-pages", "/seo", "/website-care-plans"],
      },
    },
    {
      title: "Landing pages",
      body: "High-converting landing pages for ad campaigns, product launches and lead generation.",
      href: "/landing-pages",
      nav: "Landing pages",
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
        hour: { shot: 4, mood: "day" },
        related: ["/google-meta-ads", "/premium-website-design", "/seo"],
      },
    },
    {
      title: "Google & Meta ad campaigns",
      body: "Google, Instagram and Facebook ads with the creative and targeting to turn clicks into customers.",
      href: "/google-meta-ads",
      nav: "Google & Meta ads",
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
        hour: { shot: 1, mood: "day" },
        related: ["/landing-pages", "/social-media-management", "/seo"],
      },
    },
    {
      title: "Social media management",
      body: "Content planning, post and reel design, and scheduling that keep your Instagram consistent.",
      href: "/social-media-management",
      nav: "Social media",
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
        hour: { shot: 2, mood: "day" },
        related: ["/branding", "/google-meta-ads", "/premium-website-design"],
      },
    },
    {
      title: "SEO & speed optimization",
      body: "Technical, on-page and local SEO, plus faster load times, so customers find you on Google.",
      href: "/seo",
      nav: "SEO & speed",
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
        hour: { shot: 6, mood: "day" },
        related: [
          "/premium-website-design",
          "/landing-pages",
          "/website-care-plans",
        ],
      },
    },
    {
      title: "Website care plans",
      body: "Website maintenance: hosting, security updates, backups and small edits, every month.",
      href: "/website-care-plans",
      nav: "Website care",
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
        hour: { shot: 2, mood: "night" },
        related: ["/seo", "/premium-website-design", "/landing-pages"],
      },
    },
    {
      title: "Branding starter packs",
      body: "Logo design, color palette and a social media kit for a consistent brand identity.",
      href: "/branding",
      nav: "Branding",
      page: {
        title: "Branding Starter Packs: Logo & Brand Identity Design | Bellops",
        description:
          "Branding starter packs by Bellops in India: logo design, a color palette and a social media kit, for a brand that looks the same everywhere it appears.",
        heading: "Branding Starter Packs for a Consistent Brand",
        lead: "Logo design, a color palette and a social media kit, so your brand looks the same on your website, your posts and your ads.",
        included: [
          "Logo design",
          "Color palette",
          "Social media kit",
          "A consistent brand identity",
        ],
        // Phones see the lit BellOps sign; wide screens the corner at dusk.
        hour: { shot: 7, mood: "dusk", portrait: { shot: 3, mood: "night" } },
        related: [
          "/social-media-management",
          "/premium-website-design",
          "/google-meta-ads",
        ],
      },
    },
  ] satisfies readonly Service[],
};

/** The services overview page. */
export const servicesPage = {
  path: "/services",
  title: "Web Design & Digital Marketing Services in India | Bellops",
  description:
    "Bellops' services: premium 3D websites, landing pages, Google and Meta ads, social media management, SEO, website care and branding, from one studio in Delhi.",
  heading: "Everything your brand needs online, from one studio",
  lead: "Strategy, design, development, ads and social media, from one small team in Moti Nagar, Delhi, for brands across India.",
  hour: { shot: 1, mood: "dusk" } as Hour,
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
export const faqs = [
  {
    question: "Where are you based?",
    answer: "In Moti Nagar, Delhi. We work with brands across India.",
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
  {
    question: "What does it cost?",
    answer:
      "It depends on what you need. Tell us about the project and we'll send you a quote.",
  },
];

export const contact = {
  heading: "Have a project in mind?",
  body: "Tell us about your website, ad campaign or social media goals and when you want to launch. We usually reply within a working day.",
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
  messagePlaceholder: "What you're building, your timeline, any links.",
  privacy: "We only use these details to reply to you.",
  submit: "Send enquiry",
  pending: "Sending…",
  // Both end with a WhatsApp link.
  failed: "Your enquiry didn't send. Try again, or message us on",
  busy: "That's a lot of enquiries from one connection. Wait a few minutes, or message us on",
  sentHeading: "Enquiry sent.",
  sentBody:
    "We'll reply within a working day. If it's urgent, message us on WhatsApp.",
  sendAnother: "Send another enquiry",
};
