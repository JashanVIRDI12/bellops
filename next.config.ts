import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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
    "https://*.clarity.ms https://c.bing.com",
    "https://www.facebook.com",
    "https://vercel.live https://vercel.com",
  ].join(" "),
  "font-src 'self' data: https://vercel.live",
  [
    "connect-src 'self' blob: data:",
    "https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
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
    // Optimized images are kept for a year. Images are never replaced under
    // the same name: the stills live in versioned folders (atmosphere-v6), the
    // rest get a new file name.
    minimumCacheTTL: 31536000,
  },
  // The SEO service moved from /seo to /seo-services.
  async redirects() {
    return [{ source: "/seo", destination: "/seo-services", permanent: true }];
  },
  async headers() {
    // 3D models and project screenshots are named with a hash of their
    // contents, so a file never changes under its name: cache it for a year.
    // (Screenshots live in /projects, not /work, which holds the case-study
    // pages: those must not be cached like files.)
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/models/:path*", headers: immutable },
      { source: "/projects/:path*", headers: immutable },
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

// Blog posts are MDX (content/blog). Plugins are named as strings so
// Turbopack can load them; GFM adds tables, strikethrough and autolinks.
const withMDX = createMDX({
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
