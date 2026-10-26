/*
 * Where browsers send Content Security Policy reports (next.config.ts sends
 * the policy as Report-Only). Each one becomes a single line in the server
 * logs, for checking the policy before it's enforced. It always answers
 * 204 and keeps nothing.
 */

const MAX_BODY = 8_000;
const MAX_FIELD = 300;

const clean = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/[^\x20-\x7E]/g, "").slice(0, MAX_FIELD)
    : "";

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new Response(null, { status: 204 });
    const body = JSON.parse(text) as {
      "csp-report"?: Record<string, unknown>;
    };
    const report = body["csp-report"];
    if (report)
      console.warn(
        "CSP report-only:",
        clean(report["effective-directive"] ?? report["violated-directive"]),
        "blocked",
        clean(report["blocked-uri"]),
        "on",
        clean(report["document-uri"]),
      );
  } catch {
    /* not a report: ignore it */
  }
  return new Response(null, { status: 204 });
}
