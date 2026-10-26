import { trackingAllowed } from "./client";

export type MetaEvent = "PageView" | "Lead" | "Contact";

type Pixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Pixel;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Pixel;
    _fbq?: Pixel;
  }
}

export function trackMeta(event: MetaEvent, params?: Record<string, string>) {
  if (!trackingAllowed()) return;
  window.fbq?.("track", event, params);
}

/** Queue events until Meta's script arrives; never pass enquiry fields. */
export function initializeMeta(id: string) {
  if (!trackingAllowed() || !/^\d+$/.test(id)) return;
  if (window.fbq) return;
  const pixel: Pixel = Object.assign(
    (...args: unknown[]) => {
      if (pixel.callMethod) pixel.callMethod(...args);
      else pixel.queue.push(args);
    },
    { queue: [] as unknown[][], loaded: true, version: "2.0" },
  );
  pixel.push = pixel;
  window.fbq = window._fbq = pixel;
  pixel("init", id);
  const script = document.createElement("script");
  script.id = "bellops-meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}
