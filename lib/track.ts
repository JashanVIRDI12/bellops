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
  gtag?.("event", name, { page_path: window.location.pathname, ...params });
};
