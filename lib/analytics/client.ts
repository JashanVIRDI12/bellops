/*
 * The page's side of analytics: no cookies, no third parties. A random
 * visit ID lives in sessionStorage (cleared when the tab closes); events are
 * batched and sent to /api/collect when the page is hidden or a contact
 * button is pressed. Visitors with Do Not Track or Global Privacy Control
 * switched on send nothing.
 */

import { emptyVisit, type Visit } from "./attribution";

type EventType = "pageview" | "section" | "action" | "vitals" | "engagement";
type QueuedEvent = { type: EventType; name?: string; value?: number };

const VISIT_KEY = "bellops:visit";
const ENDPOINT = "/api/collect";
const MAX_BATCH = 50;

const queue: QueuedEvent[] = [];
const vitals = new Map<string, number>(); // latest value per metric, sent last
let visit: Visit | null = null;
let timer = 0;
/** Read when a batch is sent: which scene the visitor got ("3d" or "images"). */
let sceneOf: () => string = () => "";

function allowed() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl !== true && nav.doNotTrack !== "1";
}

/** This visit's ID and where it came from, recorded on its first page. */
export function currentVisit(): Visit {
  if (visit) return visit;
  if (typeof window === "undefined") return emptyVisit;
  try {
    const saved = sessionStorage.getItem(VISIT_KEY);
    if (saved) return (visit = { ...emptyVisit, ...JSON.parse(saved) });
  } catch {
    /* storage blocked: a new visit for this page */
  }

  const params = new URLSearchParams(location.search);
  let referrer = "";
  try {
    const from = document.referrer ? new URL(document.referrer) : null;
    if (from && from.host !== location.host) referrer = from.hostname;
  } catch {
    /* no usable referrer */
  }
  visit = {
    session:
      crypto.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`,
    referrer,
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    clickId:
      params.has("gclid") || params.has("gbraid") || params.has("wbraid")
        ? "google"
        : params.has("msclkid")
          ? "microsoft"
          : params.has("fbclid")
            ? "meta"
            : "",
  };
  try {
    sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  } catch {
    /* fine: this page still counts */
  }
  return visit;
}

export function setSceneReader(read: () => string) {
  sceneOf = read;
}

export function track(type: EventType, name?: string, value?: number) {
  if (!allowed()) return;
  if (type === "vitals" && name && value !== undefined) {
    vitals.set(name, value);
    return;
  }
  queue.push({ type, name, value });
  window.clearTimeout(timer);
  timer = window.setTimeout(() => flush(), 5000);
}

/** Sends what's waiting. `final`: the page is going away, include vitals. */
export function flush(final = false) {
  if (!allowed()) return;
  window.clearTimeout(timer);
  if (final)
    for (const [name, value] of vitals)
      queue.push({ type: "vitals", name, value });
  if (final) vitals.clear();
  while (queue.length > 0) {
    const body = JSON.stringify({
      visit: currentVisit(),
      page: {
        path: location.pathname,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        scene: sceneOf(),
      },
      events: queue.splice(0, MAX_BATCH),
    });
    // text/plain keeps it a simple request; sendBeacon survives page exits.
    const blob = new Blob([body], { type: "text/plain" });
    if (!navigator.sendBeacon?.(ENDPOINT, blob))
      void fetch(ENDPOINT, {
        method: "POST",
        body: blob,
        keepalive: true,
      }).catch(() => {});
  }
}
