import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Widths offered for full-screen images. The stills are at most 1920 px
    // wide, so larger versions would only cost bytes.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    // Optimized images are kept for a year. Images are never replaced under
    // the same name: the stills live in versioned folders (atmosphere-v5), the
    // rest get a new file name.
    minimumCacheTTL: 31536000,
  },
  // 3D models and project screenshots are named with a hash of their
  // contents, so a file never changes under its name: cache it for a year.
  // (Screenshots live in /projects, not /work, which holds the case-study
  // pages: those must not be cached like files.)
  // The SEO service moved from /seo to /seo-services.
  async redirects() {
    return [{ source: "/seo", destination: "/seo-services", permanent: true }];
  },
  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    return [
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

export default nextConfig;
