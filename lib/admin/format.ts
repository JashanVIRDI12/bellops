/** Shared formatting for the admin portal. */

/* Tweakable: the time zone the portal shows dates in. */
export const ADMIN_TIME_ZONE = process.env.ADMIN_TIME_ZONE || "Asia/Kolkata";

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const whole = new Intl.NumberFormat("en-IN");

/** 1,284 below 10,000; 12.9K above. */
export const formatCount = (value: number) =>
  value < 10_000 ? whole.format(Math.round(value)) : compact.format(value);

export const formatPercent = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 1000) / 10}%` : "–";

/** 72 → "1m 12s". */
export function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const minutes = Math.floor(s / 60);
  return s % 60 ? `${minutes}m ${s % 60}s` : `${minutes}m`;
}

/** Minutes the zone is ahead of UTC at that moment, e.g. 330 for India. */
function zoneOffset(date: Date, zone: string) {
  const name =
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  return (
    (match[1] === "-" ? -1 : 1) *
    (Number(match[2]) * 60 + Number(match[3] ?? 0))
  );
}

/** Midnight at the start of `date`'s day in the zone, `daysBack` days earlier. */
export function startOfDay(date: Date, zone: string, daysBack = 0) {
  const offset = zoneOffset(date, zone) * 60_000;
  const local = new Date(date.getTime() + offset);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offset - daysBack * 86_400_000);
}
