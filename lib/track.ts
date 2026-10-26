/*
 * Google Analytics 4 events, in GA's snake_case names (whatsapp_click,
 * generate_lead, cta_click, contact_click). Calls go through the gtag queue
 * that components/analytics/GoogleAnalytics.tsx sets up, so an event sent
 * before gtag.js has loaded still arrives. Where GA is off (Do Not Track,
 * Global Privacy Control, /admin, localhost) there is no queue and nothing
 * is sent.
 *
 * Same signature as @next/third-parties' sendGAEvent, which only works with
 * that package's own GA component (it would skip the opt-outs above).
 */

type Gtag = (...args: unknown[]) => void;

export const track = (name: string, params: Record<string, string> = {}) => {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  gtag?.("event", name, {
    page_path: window.location.pathname,
    // Sent with navigator.sendBeacon, so it still arrives when the click
    // opens WhatsApp and the page goes to the background or unloads.
    transport_type: "beacon",
    ...params,
  });
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
 * - a WhatsApp link: whatsapp_click {location, button}
 * - a tel: or mailto: link: contact_click {method: phone | email}
 * - anything with data-cta: cta_click {cta, location}
 */
export function trackClick(element: Element) {
  const href = element.getAttribute("href") ?? "";
  if (href.startsWith("https://wa.me/"))
    track("whatsapp_click", {
      location: locationOf(element),
      // Which button: whatsapp-dock, whatsapp-service-landing-pages, …
      button: element.getAttribute("data-track") ?? "whatsapp",
    });
  else if (href.startsWith("tel:")) track("contact_click", { method: "phone" });
  else if (href.startsWith("mailto:"))
    track("contact_click", { method: "email" });
  const cta = element.getAttribute("data-cta");
  if (cta) track("cta_click", { cta, location: locationOf(element) });
}
