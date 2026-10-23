import "server-only";
import { createHash, createHmac } from "node:crypto";
import { describeDevice } from "./user-agent";

type HeaderSource = { get(name: string): string | null };

const decode = (value: string | null) => {
  try {
    return value ? decodeURIComponent(value) : "";
  } catch {
    return "";
  }
};

/** Coarse location from Vercel's edge (empty elsewhere). The IP is not kept. */
export function locationFrom(headers: HeaderSource) {
  return {
    country: (headers.get("x-vercel-ip-country") ?? "").slice(0, 2),
    region: decode(headers.get("x-vercel-ip-country-region")).slice(0, 80),
    city: decode(headers.get("x-vercel-ip-city")).slice(0, 80),
  };
}

export function deviceFrom(headers: HeaderSource) {
  return describeDevice(headers.get("user-agent") ?? "");
}

export function clientIp(headers: HeaderSource) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    ""
  );
}

/**
 * A visitor ID that can't be reversed and changes every day: a hash of the
 * IP and browser with a secret, daily key. It counts unique visitors per day
 * without cookies; tomorrow the same person gets a new, unrelated ID.
 */
export function dailyVisitorId(headers: HeaderSource, now = new Date()) {
  const secret =
    process.env.ANALYTICS_SALT ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "bellops-analytics";
  const dayKey = createHmac("sha256", secret)
    .update(now.toISOString().slice(0, 10))
    .digest();
  return createHash("sha256")
    .update(dayKey)
    .update(clientIp(headers))
    .update(headers.get("user-agent") ?? "")
    .digest("hex")
    .slice(0, 20);
}
