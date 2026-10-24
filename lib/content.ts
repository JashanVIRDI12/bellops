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
 * The services list. Titles also label the enquiry form's checkboxes and are
 * saved with each enquiry, so keep them short.
 */
export const services = {
  heading: "Websites, ads, social and SEO.",
  items: [
    {
      title: "Premium & 3D website design",
      body: "Custom website design and development with immersive 3D, smooth motion and a premium finish.",
    },
    {
      title: "Landing pages",
      body: "High-converting landing pages for ad campaigns, product launches and lead generation.",
    },
    {
      title: "Google & Meta ad campaigns",
      body: "Google, Instagram and Facebook ads with the creative and targeting to turn clicks into customers.",
    },
    {
      title: "Social media management",
      body: "Content planning, post and reel design, and scheduling that keep your Instagram consistent.",
    },
    {
      title: "SEO & speed optimization",
      body: "Technical, on-page and local SEO, plus faster load times, so customers find you on Google.",
    },
    {
      title: "Website care plans",
      body: "Website maintenance: hosting, security updates, backups and small edits, every month.",
    },
    {
      title: "Branding starter packs",
      body: "Logo design, color palette and a social media kit for a consistent brand identity.",
    },
  ],
};

export const contact = {
  heading: "Have a project in mind?",
  body: "Tell us about your website, ad campaign or social media goals and when you want to launch. We usually reply within a working day.",
  whatsapp: "Chat on WhatsApp",
};

/** The cookie notice shown once per browser, until the visitor presses OK. */
export const cookieNotice = {
  text: "We use cookies and similar storage to remember your choices and see how the site is used.",
  accept: "OK",
};

/** Status lines on the start-up loader, in the order they can appear. */
export const loader = {
  checking: "Checking your local time and weather",
  matching: (place?: string) =>
    place ? `Matching the sky in ${place}` : "Matching your local sky",
  lighting: "Setting the light",
  opening: "Opening the studio",
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
