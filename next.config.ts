import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 3D models and laptop screenshots keep their names when replaced, so they
  // are cached for a day (not forever), then refreshed in the background.
  async headers() {
    const cached = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    return [
      { source: "/models/:file*", headers: cached },
      { source: "/work/:file*", headers: cached },
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
