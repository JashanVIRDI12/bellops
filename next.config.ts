import { execFileSync } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import createMDX from "@next/mdx";
import { MACBOOK_URL, OFFICE_URL } from "./components/experience/scene/models";
import { projects } from "./lib/work";

/*
 * The Content Security Policy, sent as Report-Only for now: browsers report
 * what it would block (to the console and /api/csp-report) but block
 * nothing. Check the live 3D studio, analytics and the enquiry form against
 * those reports before sending it as Content-Security-Policy.
 *
 * - 'unsafe-inline' scripts: Next.js's inline bootstrap scripts and the
 *   studio's first-still preloader (nonces would make every page dynamic).
 * - 'wasm-unsafe-eval' and blob:: the 3D models' meshopt decoder is
 *   WebAssembly, and three.js decodes their textures through blob: URLs.
 * - Google Analytics, Microsoft Clarity (once it has a project ID), the
 *   optional Meta Pixel, Vercel Speed Insights and Vercel's preview toolbar.
 */
const csp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
    // React's dev tooling evaluates code; production never does.
    process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "",
    "https://www.googletagmanager.com",
    "https://www.clarity.ms https://*.clarity.ms",
    "https://connect.facebook.net",
    "https://va.vercel-scripts.com https://vercel.live",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://*.google-analytics.com https://*.googletagmanager.com",
    // GA4 with Google signals also reports to Google's own domains.
    "https://*.g.doubleclick.net https://*.google.com https://*.google.co.in",
    "https://*.clarity.ms https://c.bing.com",
    "https://www.facebook.com",
    "https://vercel.live https://vercel.com",
  ].join(" "),
  "font-src 'self' data: https://vercel.live",
  [
    "connect-src 'self' blob: data:",
    "https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
    // GA4 sends some hits to www.google.com/g/collect (Google signals).
    "https://*.g.doubleclick.net https://*.google.com https://*.google.co.in",
    "https://*.clarity.ms",
    "https://www.facebook.com https://connect.facebook.net",
    "https://vercel.live wss://ws-us3.pusher.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "frame-src https://vercel.live",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Geolocation off: the weather then always comes from the visitor's
  // coarse IP area (the scene never asked for a precise location anyway).
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // AVIF where the browser takes it (smaller), WebP otherwise.
    formats: ["image/avif", "image/webp"],
    // Widths offered for full-screen images. The stills are at most 1920 px
    // wide, so larger versions would only cost bytes.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    // Optimized images are kept for 31 days (2,678,400 s). Images are never
    // replaced under the same name: the stills live in versioned folders
    // (atmosphere-v7), the rest get a new file name.
    minimumCacheTTL: 2678400,
  },
  // The SEO service moved from /seo to /seo-services.
  async redirects() {
    return [
      { source: "/seo", destination: "/seo-services", permanent: true },
      // /index served a second copy of the home page; send it home for good
      // (301, as search engines expect for a moved page).
      { source: "/index", destination: "/", statusCode: 301 },
      // The blog's feed moved to the site's root (308: feed readers keep
      // the method and update the address).
      { source: "/blog/rss.xml", destination: "/rss.xml", permanent: true },
      // Asset addresses from before the files were named by their hash
      // (they may still be in caches or links): on to today's files.
      {
        source: "/models/office.glb",
        destination: OFFICE_URL,
        statusCode: 301,
      },
      {
        source: "/models/macbook.glb",
        destination: MACBOOK_URL,
        statusCode: 301,
      },
      {
        source: "/work/chw-desktop.webp",
        destination: projects.find(
          (project) => project.slug === "chase-healthcare-wellness",
        )!.image,
        statusCode: 301,
      },
    ];
  },
  async headers() {
    // 3D models and project screenshots are named with a hash of their
    // contents (office.8c29f4a7.glb), so a file never changes under its
    // name: cache it for a year. Only names with that 8-character hash get
    // it, so a file added without one is never stuck in caches. (Screenshots
    // live in /projects, not /work, which holds the case-study pages: those
    // must not be cached like files.)
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    const hashed = (folder: string, extension: string) =>
      `/${folder}/:file([\\w-]+\\.[0-9a-f]{8}\\.${extension})`;
    // Blog files (/blog/<post>/…: share pictures, infographics, data) keep
    // their names when design replaces them. Pictures inside posts are
    // served from hashed /_next/static addresses (lib/mdx/remark-post.mjs);
    // the share picture's address carries its hash as ?v= (lib/blog.ts), so
    // that address is cached for a year. A bare address is cached for a day
    // (then refreshed in the background for a week), so a replaced file
    // shows within a day.
    const blogFile =
      "/blog/:folder/:file([\\w.-]+\\.(?:png|jpe?g|webp|avif|gif|csv|pdf))";
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: hashed("models", "glb"), headers: immutable },
      { source: hashed("projects", "webp"), headers: immutable },
      {
        source: blogFile,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: blogFile,
        has: [{ type: "query", key: "v" }],
        headers: immutable,
      },
    ];
  },
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

/*
 * Blog posts are MDX (content/blog). Plugins are named as strings (or
 * absolute paths) so Turbopack can load them: frontmatter (the post's
 * details, not shown), GFM (tables, strikethrough, autolinks), and the
 * site's own plugin (heading ids, images, sortable tables).
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      "remark-gfm",
      path.resolve("lib/mdx/remark-post.mjs"),
    ],
  },
});

/*
 * The post index, lib/blog-index.json (scripts/blog-index.mjs): written
 * whenever Next starts, and in dev again whenever a post changes, so the
 * blog, the sitemap, RSS and proxy.ts always have every post's frontmatter
 * without reading files at request time. A post with broken frontmatter
 * stops the build.
 */
function writeBlogIndex() {
  execFileSync(process.execPath, [path.resolve("scripts/blog-index.mjs")], {
    stdio: "inherit",
  });
}

function watchPosts() {
  const key = Symbol.for("bellops.blogIndexWatcher");
  const store = globalThis as typeof globalThis & { [key]?: true };
  if (store[key]) return;
  store[key] = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(path.resolve("content/blog"), () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        writeBlogIndex();
      } catch {
        // The script printed what's wrong; the last good index stays.
      }
    }, 150);
  });
}

export default function config(phase: string): NextConfig {
  writeBlogIndex();
  if (phase === PHASE_DEVELOPMENT_SERVER) watchPosts();
  // Google Analytics comes from NEXT_PUBLIC_GA_ID (lib/analytics/ga.ts). A
  // build without it still works, with no analytics: say so in the log.
  if (
    phase === PHASE_PRODUCTION_BUILD &&
    !/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "")
  )
    console.warn(
      "⚠ NEXT_PUBLIC_GA_ID is missing or not a G- ID: this build has no Google Analytics. Set it in .env.local and in Vercel (Production and Preview).",
    );
  return withMDX(nextConfig);
}
