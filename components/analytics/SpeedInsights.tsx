"use client";

import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Speed Insights: real visitors' Core Web Vitals, per route, in the
 * Vercel dashboard (switch it on there under Speed Insights). Cookieless;
 * the admin pages are left out.
 */
export function SpeedInsights() {
  return (
    <VercelSpeedInsights
      beforeSend={(event) =>
        new URL(event.url).pathname.startsWith("/admin") ? null : event
      }
    />
  );
}
