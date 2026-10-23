import { channelFor, parseVisit } from "@/lib/analytics/attribution";
import {
  dailyVisitorId,
  deviceFrom,
  locationFrom,
} from "@/lib/analytics/request";
import { isBot } from "@/lib/analytics/user-agent";
import { saveEvents, storageKind, type AnalyticsRow } from "@/lib/leads/store";

/*
 * Receives the page's analytics events (see components/analytics/Tracker.tsx)
 * and stores them in Supabase. It always answers 204, so a blocked or failed
 * event never shows up as an error on the site.
 *
 * Not counted: bots, visitors with Do Not Track or Global Privacy Control
 * switched on, other sites posting here, and localhost (unless
 * ANALYTICS_IN_DEV=1), so testing doesn't skew the numbers.
 */

const TYPES = new Set<AnalyticsRow["type"]>([
  "pageview",
  "section",
  "action",
  "vitals",
  "engagement",
]);
const MAX_BODY = 16_000;
const MAX_EVENTS = 50;
const PER_MINUTE = 120; // events per visitor per server instance

const recent = new Map<string, { count: number; resetAt: number }>();

function overLimit(visitor: string, events: number) {
  const now = Date.now();
  if (recent.size > 5000)
    for (const [key, entry] of recent)
      if (entry.resetAt < now) recent.delete(key);
  const entry = recent.get(visitor);
  if (!entry || entry.resetAt < now) {
    recent.set(visitor, { count: events, resetAt: now + 60_000 });
    return false;
  }
  entry.count += events;
  return entry.count > PER_MINUTE;
}

const done = () => new Response(null, { status: 204 });
const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value.replace(/[^\p{L}\p{N} _./:x-]/gu, "").slice(0, max)
    : "";

export async function POST(request: Request) {
  const headers = request.headers;
  if (storageKind() !== "supabase") return done();
  if (headers.get("sec-gpc") === "1" || headers.get("dnt") === "1")
    return done();
  if (isBot(headers.get("user-agent") ?? "")) return done();

  // Only this site's own pages may post here.
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "";
  try {
    const origin = headers.get("origin");
    if (origin && new URL(origin).host !== host) return done();
  } catch {
    return done();
  }
  if (
    /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) &&
    process.env.ANALYTICS_IN_DEV !== "1"
  )
    return done();

  const text = await request.text();
  if (text.length > MAX_BODY) return done();
  let body: {
    visit?: unknown;
    page?: Record<string, unknown>;
    events?: unknown;
  };
  try {
    body = JSON.parse(text);
  } catch {
    return done();
  }

  const visit = parseVisit(body.visit);
  if (!visit.session || !Array.isArray(body.events)) return done();
  const events = body.events.slice(0, MAX_EVENTS).flatMap((raw) => {
    const event = (raw ?? {}) as Record<string, unknown>;
    if (!TYPES.has(event.type as AnalyticsRow["type"])) return [];
    const value = Number(event.value);
    return [
      {
        type: event.type as AnalyticsRow["type"],
        name: clean(event.name, 60),
        value:
          event.value === undefined ||
          !Number.isFinite(value) ||
          Math.abs(value) > 1e7
            ? null
            : value,
      },
    ];
  });
  if (events.length === 0) return done();

  const visitor = dailyVisitorId(headers);
  if (overLimit(visitor, events.length)) return done();

  const page = body.page ?? {};
  const { source, medium, campaign } = channelFor(visit);
  const place = locationFrom(headers);
  const { device, browser, os } = deviceFrom(headers);
  const shared = {
    session_id: visit.session,
    visitor_id: visitor,
    path: clean(page.path, 200) || "/",
    referrer: visit.referrer.slice(0, 200),
    source,
    medium,
    campaign,
    ...place,
    device,
    browser,
    os,
    screen: clean(page.screen, 12),
    language: clean(page.language, 16),
    scene: clean(page.scene, 12),
  };

  try {
    await saveEvents(events.map((event) => ({ ...shared, ...event })));
  } catch (error) {
    console.error("Analytics events weren't saved:", error);
  }
  return done();
}
