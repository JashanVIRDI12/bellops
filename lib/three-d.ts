import { shot, type Hour } from "./content";
import { formatInr } from "./pricing";

/*
 * /3d-website-design: the copy drafted in 3d-website-design.md, with Bellops'
 * own prices, timelines, tools and terms filled in (October 2026). Prices
 * and timelines here also feed the page's tables and FAQ answers, so they
 * always agree. Change them here.
 */

type Row = { name: string; price: string; timeline: string };

/** What each kind of 3D project costs and takes. */
export const threeDRates: readonly Row[] = [
  {
    name: "3D landing page (one page)",
    price: `From ${formatInr(50_000)}`,
    timeline: "About 2 weeks",
  },
  {
    name: "One 3D page + standard pages",
    price: `From ${formatInr(75_000)}`,
    timeline: "3 to 4 weeks",
  },
  {
    name: "Full 3D website",
    price: `${formatInr(100_000)} to ${formatInr(150_000)}`,
    timeline: "About 1 month",
  },
  {
    name: "3D product configurator",
    price: `From ${formatInr(100_000)}`,
    timeline: "About 1 month, longer with custom models",
  },
  {
    name: "Adding 3D to an existing site",
    price: `From ${formatInr(30_000)}`,
    timeline: "1 to 2 weeks",
  },
];

/** Models made just for the client (licensed stock models cost nothing extra). */
export const customModelPrice = `From ${formatInr(5_000)} per model`;

export const threeDPage = {
  path: "/3d-website-design",
  title: "3D Website Design Agency in India | Bellops",
  description:
    "Bellops is a 3D website design agency in India building fast, immersive Three.js and WebGL sites, product configurators and 3D landing pages.",
  shareTitle: "Premium 3D Website Design Agency in India | Bellops",
  shareDescription:
    "Immersive 3D websites that still load fast and rank. Designed and coded in-house by one small team. Tell us about your project.",
  nav: "3D website design",
  // Its entry in the header's Services menu.
  menu: {
    label: "3D websites",
    body: "Immersive Three.js and WebGL websites, configurators and 3D landing pages that still load fast.",
  },
  heading: "3D Website Design with Three.js & WebGL",
  lead: "Immersive 3D websites that load fast, rank on Google and turn visitors into enquiries.",
  hour: { shot: shot("three-d"), mood: "night" } as Hour,
  intro:
    "Bellops is an independent web design studio, Delhi-based and working remotely across India. We design and build premium websites with real-time 3D, smooth motion and a finish people remember. We also make sure they work properly: quick on a mid-range phone, readable by search engines and built around what your customers actually need to do.",
  why: {
    heading: "Why brands come to a 3D website design agency",
    body: [
      "A flat template tells visitors you're like everyone else. A well-made 3D experience lets them turn your product around, explore a space or feel your brand before they ever call you. Done badly, though, 3D means slow pages, drained batteries and a site Google can't read.",
      "Our job is to give you the first without the second. We plan every page around your customers and what they search for, before anything is designed. The people who design your website code it too, so nothing gets lost in handoff. And every 3D scene ships with a lighter version for slower phones.",
    ],
  },
  services: {
    heading: "Our 3D website design services",
    items: [
      {
        title: "Immersive brand websites",
        body: "Full websites where 3D is part of the story: scroll-driven scenes, animated products, interactive hero sections and smooth page transitions. Ideal for premium, luxury, lifestyle, real estate, automotive and tech brands that need to stand out.",
      },
      {
        title: "3D product configurator websites",
        body: "Let customers rotate a product, switch colours, materials or finishes, and see the result in real time. A 3D product configurator helps buyers understand what they are getting, which is especially useful for furniture, vehicles, jewellery, equipment and packaging.",
      },
      {
        title: "3D landing pages",
        body: "Focused, high-converting pages for launches, ad campaigns and lead generation, with a single striking 3D moment and a clear call to action. When 3D isn't the right fit, we build standard landing pages.",
        link: { label: "Landing pages", href: "/landing-pages" },
      },
      {
        title: "Interactive website design",
        body: "Not every project needs a full 3D world. Sometimes the right answer is subtle: micro-interactions, motion, parallax and one interactive element in the right place, using only as much movement as the page needs.",
      },
      {
        title: "3D on an existing website",
        body: "Already have a site you like? We can add a 3D hero, product viewer or interactive section without rebuilding everything.",
      },
    ],
  },
  process: {
    heading: "Our process",
    note: "Discovery to launch, one small team.",
    steps: [
      {
        title: "Discovery and strategy",
        body: "We learn your business, customers, competitors and goals, and research what your buyers search for. You get a clear plan and page structure before any design starts.",
      },
      {
        title: "Concept and art direction",
        body: "Moodboards, visual direction and a description of the key 3D moments: what moves, what users can interact with and why. You review a sample before we go further.",
      },
      {
        title: "3D assets and models",
        body: `We source licensed 3D models from trusted marketplaces and optimise their textures and lighting for the web, or work from your CAD files and product photos. Models made just for you are available at extra cost (${customModelPrice.toLowerCase()}).`,
      },
      {
        title: "Design",
        body: "Layouts for desktop and mobile, with the 3D scenes placed where they help the story and the conversion, not in their way.",
      },
      {
        title: "Development",
        body: "We build in Three.js and WebGL alongside a modern front end, with lighter versions for slower devices and browsers.",
      },
      {
        title: "Performance and SEO pass",
        body: "Compression, lazy loading, Core Web Vitals checks, metadata, schema and on-page SEO before launch.",
      },
      {
        title: "Launch and care",
        body: "We go live, test on real devices and stay on hand afterwards. Ongoing support is available through our website care plans: hosting, security updates, backups and small edits.",
      },
    ],
  },
  timeline: {
    heading: "Timeline",
    intro:
      "Most projects take 2 weeks to a month, depending on scope, the number of 3D scenes and how ready your content and assets are.",
    after:
      "What speeds things up: final copy, brand assets and product models (or CAD files) ready at kick-off, and one clear decision-maker on your side.",
  },
  pricing: {
    heading: "How much does a 3D website cost in India?",
    intro:
      "We'd rather be upfront than make you book a call just to get a number. Pricing depends on how many 3D scenes you need, whether models must be made from scratch, how interactive they are and how many pages the site has.",
    mixed:
      "Not every page needs 3D. A common choice is one 3D page, usually the home page, with the rest built as fast standard pages: the impact where it counts, without paying for 3D on every page. That's the middle row above.",
    factors: [
      "Number and complexity of 3D scenes",
      "Whether licensed models will do, or custom models need to be made",
      "Level of interactivity: viewing, or full configuration with options and pricing",
      "Number of pages, languages and integrations (CRM, ecommerce, forms)",
      "Content and copywriting support",
    ],
    terms:
      "Every quote is fixed and itemised after discovery. We share a sample first; once you've approved it, we start with 50% upfront.",
  },
  stack: {
    heading: "Our tech stack",
    intro:
      "As a Three.js development agency in India, we pick tools for speed and longevity, not novelty.",
    items: [
      {
        title: "3D and rendering",
        body: "Three.js on WebGL, with React Three Fiber, for real-time 3D in the browser.",
      },
      { title: "Front end", body: "Next.js and React." },
      { title: "Models", body: "glTF and GLB, compressed for the web." },
      { title: "Motion", body: "GSAP, with Lenis for smooth scrolling." },
      {
        title: "Hosting and editing",
        body: "Vercel hosting, and a custom admin portal when your team needs to edit text, images and products without touching the 3D code.",
      },
    ],
  },
  performance: {
    heading: "Fast on mobile, built to rank",
    intro:
      "Most of your visitors in India will arrive on a phone, often on mobile data. A 3D site that only works on a fast laptop loses customers, so performance and SEO are built in from day one.",
    items: [
      {
        title: "A lighter version of every 3D scene",
        body: "Slower phones get it automatically, so nobody is stuck on a loading screen.",
      },
      {
        title: "Core Web Vitals built in",
        body: "Compressed models and textures, lazy-loaded scenes, and content that renders before the 3D does.",
      },
      {
        title: "Content search engines can read",
        body: "Real HTML headings, copy and links, not text baked into a canvas Google can't see.",
      },
      {
        title: "Technical and on-page SEO",
        body: "Metadata, structured data, clean URLs and internal linking.",
      },
      {
        title: "Accessibility fallbacks",
        body: "Respect for reduced-motion settings, and a usable page if WebGL isn't available.",
      },
    ],
  },
  whyUs: {
    heading: "Why Bellops",
    items: [
      {
        title: "One small team, start to finish",
        body: "Strategy, design, 3D and development under one roof, with no handoff gaps.",
      },
      {
        title: "Built to grow after launch",
        body: "We also run Google and Meta ads, social media management and SEO, so your new site doesn't sit idle.",
      },
      {
        title: "Premium without the bloat",
        body: "3D where it earns its place, speed everywhere else.",
      },
      {
        title: "Clear communication",
        body: "We usually reply within a working day.",
      },
    ],
  },
  faqs: [
    {
      question: "What is a 3D website?",
      answer:
        "A website that renders interactive 3D objects or scenes in the browser, usually with Three.js and WebGL. Visitors can rotate, explore or scroll through the 3D, with no app or plugin to install.",
    },
    {
      question: "Will a 3D website slow down my site?",
      answer:
        "It doesn't have to. We compress models and textures, load scenes only when needed and ship a lighter version of every 3D scene for slower phones, while keeping Core Web Vitals in check.",
    },
    {
      question: "Can a 3D website rank on Google?",
      answer:
        "Yes, if it's built properly. We keep headings, copy and links in real HTML that search engines can read, and add technical SEO, metadata and structured data.",
    },
    {
      question: "How much does a 3D website cost in India?",
      answer: `It depends on the number of scenes, the models and how interactive it is. A one-page 3D website starts from ${formatInr(50_000)}, and a full 3D website costs ${formatInr(100_000)} to ${formatInr(150_000)}. You'll get a fixed, itemised quote after discovery.`,
    },
    {
      question: "How long does it take to build a 3D website?",
      answer:
        "A 3D landing page typically takes about 2 weeks, and a full immersive website about a month, depending on scope and how ready your content is.",
    },
    {
      question: "Do I need to provide 3D models?",
      answer: `No. We use licensed models from trusted marketplaces and optimise them for the web, or work from your CAD files and existing models. Models made just for you are available at extra cost, ${customModelPrice.toLowerCase()}.`,
    },
    {
      question: "What is a 3D product configurator website?",
      answer:
        "A page where customers can view your product in 3D and change options such as colour, material or finish in real time, helping them understand exactly what they're buying.",
    },
    {
      question: "Do you work with clients outside Delhi?",
      answer: "Yes. We're Delhi-based, working remotely across India.",
    },
  ],
};
