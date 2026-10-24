"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackingAllowed } from "@/lib/analytics/client";
import { whenIdle } from "@/components/three/utils/whenIdle";

/** The Google Analytics 4 property. */
const MEASUREMENT_ID = "G-GC08E6VQ91";
/* Tweakable: the longest wait (ms) for a quiet moment before it loads. */
const IDLE_WAIT = 2000;

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

let started = false;

/**
 * Google's tag (gtag.js), the standard snippet, loaded once the page is idle
 * so it never holds up the first paint. Like the site's own analytics, it
 * stays off for browsers that ask not to be tracked (Do Not Track, Global
 * Privacy Control), on the admin pages and on localhost. Page views on
 * client-side navigation come from GA4's enhanced measurement (history
 * changes), which is on by default.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const admin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (started || admin || !trackingAllowed()) return;
    if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
    return whenIdle(() => {
      if (started) return;
      started = true;
      const w = window as GtagWindow;
      w.dataLayer = w.dataLayer || [];
      w.gtag = function gtag() {
        // gtag.js expects each call's own `arguments` object, not an array.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
      w.gtag("js", new Date());
      w.gtag("config", MEASUREMENT_ID);
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }, IDLE_WAIT);
  }, [admin]);

  return null;
}
