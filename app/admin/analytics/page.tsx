import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ADMIN_TIME_ZONE,
  formatCount,
  formatDuration,
  formatPercent,
  startOfDay,
} from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { chapters } from "@/lib/content";
import {
  StorageError,
  analyticsSummary,
  storageKind,
  type AnalyticsSummary,
} from "@/lib/leads/store";
import { projects } from "@/lib/work";
import { DailyChart, RankedTable } from "./charts";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

const plural = (count: number, one: string, many: string) =>
  `${formatCount(count)} ${count === 1 ? one : many}`;

const chapterNames: Record<string, string> = {
  intro: "Opening scene",
  studio: "Studio",
  approach: "Approach",
  work: "Work",
  services: "Services",
  contact: "Contact",
};

const actionNames: Record<string, string> = {
  "whatsapp-intro": "WhatsApp, opening scene",
  "whatsapp-dock": "WhatsApp, floating button",
  "whatsapp-contact": "WhatsApp, contact section",
  "whatsapp-form": "WhatsApp, after the form",
  whatsapp: "WhatsApp, other link",
  "call-dock": "Call, floating button",
  "call-contact": "Call, contact section",
  call: "Call, other link",
  "email-contact": "Email, contact section",
  "email-form": "Email, from the form",
  email: "Email, other link",
  "start-project": "Pressed “Start a project”",
  "enquiry-started": "Started the enquiry form",
  "enquiry-sent": "Sent an enquiry",
};

function actionName(name: string) {
  if (actionNames[name]) return actionNames[name];
  if (name.startsWith("project-")) {
    const project = projects.find((item) => `project-${item.slug}` === name);
    return `Opened ${project?.client ?? name.slice(8)}`;
  }
  if (name.startsWith("social-")) return `Opened ${name.slice(7)}`;
  return name;
}

/** Short words for the recent-visits table. */
function didWords(actions: string[]) {
  const words = new Set<string>();
  for (const action of actions) {
    if (action === "enquiry-sent") words.add("Enquiry");
    else if (action.startsWith("whatsapp")) words.add("WhatsApp");
    else if (action.startsWith("call")) words.add("Call");
    else if (action.startsWith("email")) words.add("Email");
    else if (action.startsWith("project-")) words.add("Project");
  }
  return [...words].join(", ") || "–";
}

// Web Vitals: Google's "good" and "poor" thresholds at the 75th percentile.
const VITALS = [
  { name: "LCP", label: "Largest paint", good: 2500, poor: 4000, unit: "s" },
  { name: "INP", label: "Response to taps", good: 200, poor: 500, unit: "ms" },
  { name: "CLS", label: "Layout shift", good: 0.1, poor: 0.25, unit: "" },
] as const;

function formatVital(value: number, unit: string) {
  if (unit === "s") return `${(value / 1000).toFixed(1)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return value.toFixed(2);
}

export default function AnalyticsPage({
  searchParams,
}: PageProps<"/admin/analytics">) {
  return (
    <Suspense fallback={<p className="admin-main text-white/60">Loading…</p>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: PageProps<"/admin/analytics">["searchParams"];
}) {
  await requireAdmin();
  const params = await searchParams;
  const range = RANGES.find((item) => item.id === params.range) ?? RANGES[1]; // 7 days
  const until = new Date();
  const since = startOfDay(until, ADMIN_TIME_ZONE, range.days - 1);

  let data: AnalyticsSummary | null = null;
  let problem: StorageError["reason"] | null = null;
  if (storageKind() !== "supabase") problem = "missing";
  else {
    try {
      data = await analyticsSummary(since, until, ADMIN_TIME_ZONE);
    } catch (error) {
      console.error("Analytics couldn't be loaded:", error);
      problem = error instanceof StorageError ? error.reason : "other";
    }
  }

  return (
    <main className="admin-main">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Analytics
          </h1>
          <p className="mt-1 max-w-[60ch] text-white/65">
            Visits to the website, counted without cookies. Visitor IDs reset
            every day and can&apos;t identify anyone.
          </p>
        </div>
        {data && (
          <p className="an-live">
            <span aria-hidden="true" className="an-live-dot" />
            {data.live === 1
              ? "1 person on the site now"
              : `${formatCount(data.live)} people on the site now`}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <nav aria-label="Date range">
          <ul className="flex flex-wrap gap-1.5">
            {RANGES.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/analytics?range=${item.id}`}
                  aria-current={item.id === range.id ? "page" : undefined}
                  className="admin-tab"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {data && data.totals.sessions > 0 && (
          <a
            href={`/admin/analytics/export?range=${range.id satisfies RangeId}`}
            className="admin-button admin-button--quiet"
          >
            Export events (CSV)
          </a>
        )}
      </div>

      {problem && <Problem reason={problem} />}
      {data && data.totals.sessions === 0 && (
        <p className="py-16 text-white/65">
          No visits in this period yet. Visits show up here a few seconds after
          someone leaves or switches away from the site.
        </p>
      )}
      {data && data.totals.sessions > 0 && <Report data={data} />}
    </main>
  );
}

function Problem({ reason }: { reason: StorageError["reason"] }) {
  const text =
    reason === "missing"
      ? "Analytics needs the Supabase database. Add SUPABASE_URL and SUPABASE_SECRET_KEY (see the README)."
      : reason === "setup"
        ? "Supabase is missing the analytics tables. Run supabase/schema.sql in Supabase's SQL Editor, then reload."
        : reason === "key"
          ? "Supabase rejected the key. Check SUPABASE_SECRET_KEY."
          : "Analytics couldn't be loaded. Reload the page to try again.";
  return (
    <p role="alert" className="admin-notice">
      {text}
    </p>
  );
}

function Report({ data }: { data: AnalyticsSummary }) {
  const { totals } = data;
  const reachedBy = new Map(
    data.sections.map((row) => [row.name, row.sessions]),
  );
  const funnel = chapters.map((chapter) => ({
    label: chapterNames[chapter.id] ?? chapter.id,
    sessions: reachedBy.get(chapter.id) ?? 0,
    contacts: 0,
  }));
  const contactActions = totals.whatsapp + totals.calls + totals.emails;

  return (
    <>
      <dl className="an-kpis">
        <Stat
          label="Visitors"
          value={formatCount(totals.visitors)}
          note={plural(totals.sessions, "visit", "visits")}
        />
        <Stat label="Page views" value={formatCount(totals.pageviews)} />
        <Stat
          label="Average time on site"
          value={formatDuration(totals.engagedSeconds)}
          note="While the page was on screen"
        />
        <Stat
          label="Engaged visits"
          value={formatPercent(totals.engagedSessions, totals.sessions)}
          note="Stayed 10s+, scrolled on or pressed something"
        />
        <Stat
          label="Contact rate"
          value={formatPercent(totals.contactSessions, totals.sessions)}
          note={`${plural(totals.contactSessions, "visit", "visits")} used WhatsApp, call, email or the form`}
        />
        <Stat
          label="Enquiries sent"
          value={formatCount(totals.enquiries)}
          note={`Plus ${plural(contactActions, "WhatsApp, call or email tap", "WhatsApp, call and email taps")}`}
        />
      </dl>

      <section className="an-section" aria-labelledby="an-daily">
        <h2 id="an-daily" className="an-heading">
          Visitors per day
        </h2>
        <DailyChart days={data.daily} />
      </section>

      <div className="an-columns">
        <section className="an-section" aria-labelledby="an-sources">
          <h2 id="an-sources" className="an-heading">
            Where visitors come from
          </h2>
          <RankedTable
            rows={data.sources}
            label="Source"
            withContacts
            empty="No visits yet."
          />
        </section>
        <section className="an-section" aria-labelledby="an-campaigns">
          <h2 id="an-campaigns" className="an-heading">
            Ad campaigns
          </h2>
          <RankedTable
            rows={data.campaigns}
            label="Campaign"
            withContacts
            empty="No tagged campaigns yet. Add utm_campaign to your ad links, for example ?utm_source=meta&utm_medium=paid&utm_campaign=diwali."
          />
        </section>
        <section className="an-section" aria-labelledby="an-funnel">
          <h2 id="an-funnel" className="an-heading">
            How far visitors get
          </h2>
          <RankedTable
            rows={funnel}
            label="Scene"
            total={totals.sessions}
            keepOrder
            empty="No scenes reached yet."
          />
        </section>
        <section className="an-section" aria-labelledby="an-actions">
          <h2 id="an-actions" className="an-heading">
            What visitors pressed
          </h2>
          <RankedTable
            rows={data.actions.map((row) => ({
              label: actionName(row.name),
              sessions: row.count,
              contacts: 0,
            }))}
            label="Button"
            valueLabel="Times"
            empty="Nobody has pressed a contact button yet."
          />
        </section>
        <section className="an-section" aria-labelledby="an-cities">
          <h2 id="an-cities" className="an-heading">
            Cities
          </h2>
          <RankedTable
            rows={data.cities}
            label="City"
            withContacts
            empty="No locations yet."
          />
        </section>
        <section className="an-section" aria-labelledby="an-devices">
          <h2 id="an-devices" className="an-heading">
            Devices
          </h2>
          <RankedTable
            rows={data.devices}
            label="Device"
            withContacts
            empty="–"
          />
          <h3 className="an-subheading">Browsers</h3>
          <RankedTable rows={data.browsers} label="Browser" empty="–" />
        </section>
        <section className="an-section" aria-labelledby="an-referrers">
          <h2 id="an-referrers" className="an-heading">
            Referring sites
          </h2>
          <RankedTable
            rows={data.referrers}
            label="Site"
            withContacts
            empty="No other sites have sent visitors yet."
          />
        </section>
        <section className="an-section" aria-labelledby="an-speed">
          <h2 id="an-speed" className="an-heading">
            Site speed
          </h2>
          <p className="an-help">
            What 3 in 4 visitors experienced or better, measured on their own
            devices.
          </p>
          <dl className="an-vitals">
            {VITALS.map((vital) => {
              const reading = data.vitals[vital.name];
              const status = !reading
                ? null
                : reading.p75 <= vital.good
                  ? "good"
                  : reading.p75 <= vital.poor
                    ? "fair"
                    : "poor";
              return (
                <div key={vital.name} className="an-vital">
                  <dt>
                    {vital.label}{" "}
                    <span className="text-white/50">({vital.name})</span>
                  </dt>
                  <dd className="an-vital-value">
                    {reading ? formatVital(reading.p75, vital.unit) : "–"}
                  </dd>
                  <dd
                    className="an-vital-status"
                    data-status={status ?? "none"}
                  >
                    <span aria-hidden="true" className="an-status-icon">
                      {status === "good"
                        ? "✓"
                        : status === "fair"
                          ? "!"
                          : status === "poor"
                            ? "✕"
                            : "–"}
                    </span>
                    {status === "good" && "Good"}
                    {status === "fair" && "Needs work"}
                    {status === "poor" && "Poor"}
                    {!status && "Not enough data yet"}
                    {reading && (
                      <span className="block font-normal text-white/50">
                        From {plural(reading.samples, "visit", "visits")}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <h3 className="an-subheading">What the studio showed</h3>
          <RankedTable
            rows={data.scenes.map((row) => ({
              label:
                row.label === "3d"
                  ? "Live 3D studio"
                  : row.label === "images"
                    ? "Images (phones, older devices)"
                    : "Unknown",
              sessions: row.sessions,
              contacts: 0,
            }))}
            label="Version"
            empty="–"
          />
        </section>
      </div>

      <section className="an-section" aria-labelledby="an-recent">
        <h2 id="an-recent" className="an-heading">
          Recent visits
        </h2>
        <RecentVisits rows={data.recent} />
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="an-stat">
      <dt className="an-stat-label">{label}</dt>
      <dd className="an-stat-value">{value}</dd>
      {note && <dd className="an-stat-note">{note}</dd>}
    </div>
  );
}

const visitTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ADMIN_TIME_ZONE,
});

function RecentVisits({ rows }: { rows: AnalyticsSummary["recent"] }) {
  return (
    <div className="an-table-wrap">
      <table className="an-table">
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Came from</th>
            <th scope="col">Place</th>
            <th scope="col">Device</th>
            <th scope="col">Got to</th>
            <th scope="col">Contacted</th>
            <th scope="col" className="an-num">
              On site
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.started_at}-${row.city}-${row.browser}`}>
              <td className="whitespace-nowrap">
                {visitTime.format(new Date(row.started_at))}
              </td>
              <td>
                {row.source || "Direct"}
                {row.campaign && (
                  <span className="block text-white/50">{row.campaign}</span>
                )}
              </td>
              <td>
                {[row.city, row.country].filter(Boolean).join(", ") || "–"}
              </td>
              <td>
                {row.device}
                <span className="block text-white/50">
                  {row.browser} on {row.os}
                </span>
              </td>
              <td>{chapterNames[row.furthest ?? ""] ?? "–"}</td>
              <td>{didWords(row.actions)}</td>
              <td className="an-num">{formatDuration(row.engaged)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
