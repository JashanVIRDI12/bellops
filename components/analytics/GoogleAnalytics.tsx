"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackingAllowed } from "@/lib/analytics/client";
import { trackClick } from "@/lib/track";
import { whenIdle } from "@/components/three/utils/whenIdle";

/** The Google Analytics 4 property. */
const MEASUREMENT_ID = "G-GC08E6VQ91";
/* Tweakable: the longest wait (ms), after the page has loaded, for a quiet
   moment before gtag.js (~180 KB) loads. */
const IDLE_WAIT = 5000;

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

let started = false;

/**
 * Google's tag (gtag.js), the standard snippet. The gtag queue is set up at
 * once, so events (lib/track.ts) sent early are kept, and they go by beacon;
 * gtag.js itself loads like next/script's "lazyOnload": after the page's
 * load event and then a quiet moment, so it never competes with the first
 * paint or the page becoming interactive. Like the
 * site's own analytics, it stays off for browsers that ask not to be tracked
 * (Do Not Track, Global Privacy Control), on the admin pages and on
 * localhost. Page views on client-side navigation come from GA4's enhanced
 * measurement (history changes), which is on by default.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const admin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (started || admin || !trackingAllowed()) return;
    if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
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
    // Not cancelled on unmount: the queue above is already in use.
    const load = () =>
      whenIdle(() => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
        document.head.appendChild(script);
      }, IDLE_WAIT);
    if (document.readyState === "complete") load();
    else window.addEventListener("load", load, { once: true });
  }, [admin]);

  // One listener for the whole site: WhatsApp, phone and email links and the
  // calls to action (lib/track.ts). Nothing is sent where GA is off.
  useEffect(() => {
    if (admin) return;
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.("a, button");
      if (target) trackClick(target);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [admin]);

  return null;
}
