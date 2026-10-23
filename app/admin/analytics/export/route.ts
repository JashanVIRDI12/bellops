import { ADMIN_TIME_ZONE, startOfDay } from "@/lib/admin/format";
import { isAdmin } from "@/lib/admin/session";
import { listEvents } from "@/lib/leads/store";

const DAYS: Record<string, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** Every analytics event in the chosen range, as a CSV file. */
export async function GET(request: Request) {
  if (!(await isAdmin()))
    return new Response("Sign in at /admin/login first.", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });

  const range = new URL(request.url).searchParams.get("range") ?? "7d";
  const until = new Date();
  const since = startOfDay(until, ADMIN_TIME_ZONE, (DAYS[range] ?? 7) - 1);
  const events = await listEvents(since, until);

  const columns = [
    "created_at",
    "session_id",
    "visitor_id",
    "type",
    "name",
    "value",
    "path",
    "source",
    "medium",
    "campaign",
    "referrer",
    "country",
    "region",
    "city",
    "device",
    "browser",
    "os",
    "screen",
    "language",
    "scene",
  ] as const;
  const csv =
    "﻿" +
    [
      columns.join(","),
      ...events.map((event) =>
        columns.map((column) => cell(String(event[column] ?? ""))).join(","),
      ),
    ].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bellops-analytics-${range}-${until.toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Quotes a value, and stops spreadsheets running text that looks like a formula. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
