/*
 * Google Analytics 4 events, in GA's snake_case names (whatsapp_click,
 * generate_lead, cta_click, contact_click). Calls go through gtag(), which
 * Google's tag (components/analytics/GoogleAnalytics.tsx) defines once the
 * page has hydrated, so the first page view is configured before any event.
 * An event sent before that (the A/B test's impression on load) waits here
 * and goes as soon as gtag() exists. Where GA isn't on the page (/admin, or
 * a build without NEXT_PUBLIC_GA_ID) the queue gives up and nothing is sent.
 *
 * track() has the same signature as @next/third-parties' sendGAEvent.
 */

import { readDockVariant } from "./ab";

type Gtag = (...args: unknown[]) => void;

/* Tweakable: how long an early event waits for Google's tag (ms). */
const WAIT_FOR_TAG = 20000;

const waiting: ((gtag: Gtag) => void)[] = [];
let poll: number | undefined;

const currentGtag = () => (window as Window & { gtag?: Gtag }).gtag;

/** Runs `call` with gtag() now, or once Google's tag has defined it. */
export function withGtag(call: (gtag: Gtag) => void) {
  if (typeof window === "undefined") return;
  const gtag = currentGtag();
  if (gtag) return call(gtag);
  waiting.push(call);
  if (poll !== undefined) return;
  const started = Date.now();
  poll = window.setInterval(() => {
    const ready = currentGtag();
    if (!ready && Date.now() - started < WAIT_FOR_TAG) return;
    window.clearInterval(poll);
    poll = undefined;
    const calls = waiting.splice(0);
    if (ready) for (const queued of calls) queued(ready);
  }, 200);
}

export const track = (name: string, params: Record<string, string> = {}) => {
  if (typeof window === "undefined") return;
  const page_path = window.location.pathname;
  withGtag((gtag) =>
    gtag("event", name, {
      page_path,
      // Sent with navigator.sendBeacon, so it still arrives when the click
      // opens WhatsApp and the page goes to the background or unloads.
      transport_type: "beacon",
      ...params,
    }),
  );
};

/** Where a link sits: the nearest data-ga-location (header, hero, footer…). */
function locationOf(element: Element) {
  return (
    element.closest("[data-ga-location]")?.getAttribute("data-ga-location") ??
    "page"
  );
}

/**
 * The events a click can send, from what was clicked:
 * - a WhatsApp link (not the A/B dock): whatsapp_click {location, button, variant}
 * - a tel: or mailto: link: contact_click {method: phone | email, variant}
 * - anything with data-cta: cta_click {cta, location}
 */
export function trackClick(element: Element) {
  const href = element.getAttribute("href") ?? "";
  // The A/B dock (data-variant) sends its own dock_click (ContactDock.tsx),
  // so its taps aren't counted twice.
  if (
    href.startsWith("https://wa.me/") &&
    !element.hasAttribute("data-variant")
  )
    track("whatsapp_click", {
      location: locationOf(element),
      // Which button: whatsapp-service-landing-pages, whatsapp-footer, …
      button: element.getAttribute("data-track") ?? "whatsapp",
      variant: readDockVariant(),
    });
  else if (href.startsWith("tel:"))
    track("contact_click", { method: "phone", variant: readDockVariant() });
  else if (href.startsWith("mailto:"))
    track("contact_click", { method: "email", variant: readDockVariant() });
  const cta = element.getAttribute("data-cta");
  if (cta) track("cta_click", { cta, location: locationOf(element) });
}
