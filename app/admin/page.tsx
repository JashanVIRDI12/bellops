import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { callHref, whatsappHref } from "@/lib/contact-links";
import { StorageError, listLeads, storageKind } from "@/lib/leads/store";
import {
  isLeadStatus,
  leadStatuses,
  statusLabels,
  type Lead,
  type LeadStatus,
} from "@/lib/leads/types";
import { signOut } from "./actions";
import { LeadControls } from "./LeadControls";

export const metadata: Metadata = { title: "Enquiries" };

/* Tweakable: the time zone enquiry times are shown in. */
const TIME_ZONE = process.env.ADMIN_TIME_ZONE || "Asia/Kolkata";

const received = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="admin-main text-white/60">Loading…</p>}>
      <Inbox searchParams={searchParams} />
    </Suspense>
  );
}

async function Inbox({
  searchParams,
}: {
  searchParams: PageProps<"/admin">["searchParams"];
}) {
  await requireAdmin();
  const params = await searchParams;
  const filter = isLeadStatus(params.status) ? params.status : null;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const storage = storageKind();
  let leads: Lead[] = [];
  let loadProblem: StorageError["reason"] | null = null;
  if (storage !== "missing") {
    try {
      leads = await listLeads();
    } catch (error) {
      console.error("Enquiries could not be loaded:", error);
      loadProblem = error instanceof StorageError ? error.reason : "other";
    }
  }

  const matching = query ? leads.filter((lead) => matches(lead, query)) : leads;
  const counts = Object.fromEntries(
    leadStatuses.map((status) => [
      status,
      matching.filter((lead) => lead.status === status).length,
    ]),
  ) as Record<LeadStatus, number>;
  const shown = filter
    ? matching.filter((lead) => lead.status === filter)
    : matching;

  const tabHref = (status: LeadStatus | null) => {
    const next = new URLSearchParams();
    if (status) next.set("status", status);
    if (query) next.set("q", query);
    const search = next.toString();
    return search ? `/admin?${search}` : "/admin";
  };

  return (
    <main className="admin-main">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Enquiries
          </h1>
          <p className="mt-1 text-white/65">
            {leads.length === 0
              ? "Nothing yet."
              : `${leads.length} in total, ${leads.filter((lead) => lead.status === "new").length} new.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {leads.length > 0 && (
            <a
              href="/admin/export"
              className="admin-button admin-button--quiet"
            >
              Export CSV
            </a>
          )}
          <form action={signOut}>
            <button type="submit" className="admin-button admin-button--quiet">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {storage === "missing" && (
        <p role="alert" className="admin-notice">
          Enquiries can&apos;t be saved yet: no database is connected. In
          Vercel, open this project&apos;s Storage tab, connect Supabase, run{" "}
          <code>supabase/schema.sql</code> in Supabase&apos;s SQL Editor, then
          redeploy. Until then, the contact form asks visitors to use WhatsApp
          or email.
        </p>
      )}
      {storage === "file" && (
        <p className="admin-notice admin-notice--info">
          Saving to <code>.data/leads.json</code> on this computer. Add
          SUPABASE_URL and SUPABASE_SECRET_KEY to <code>.env.local</code> to use
          Supabase instead.
        </p>
      )}
      {loadProblem === "setup" && (
        <p role="alert" className="admin-notice">
          Supabase is connected, but its tables aren&apos;t set up. In the
          Supabase dashboard, open SQL Editor, paste the contents of{" "}
          <code>supabase/schema.sql</code> and press Run. Then reload this page.
        </p>
      )}
      {loadProblem === "key" && (
        <p role="alert" className="admin-notice">
          Supabase rejected the key. Check that SUPABASE_SECRET_KEY is the
          project&apos;s secret key (it starts with <code>sb_secret_</code>),
          not the publishable key.
        </p>
      )}
      {loadProblem === "other" && (
        <p role="alert" className="admin-notice">
          Enquiries couldn&apos;t be loaded. Reload the page to try again.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <nav aria-label="Filter by status">
          <ul className="flex flex-wrap gap-1.5">
            {[null, ...leadStatuses].map((status) => (
              <li key={status ?? "all"}>
                <Link
                  href={tabHref(status)}
                  aria-current={filter === status ? "page" : undefined}
                  className="admin-tab"
                >
                  {status ? statusLabels[status] : "All"}
                  <span className="admin-tab-count">
                    {status ? counts[status] : matching.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form role="search" action="/admin" className="flex gap-2">
          {filter && <input type="hidden" name="status" value={filter} />}
          <label htmlFor="admin-search" className="sr-only">
            Search enquiries
          </label>
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search enquiries"
            className="admin-input w-64 max-w-full py-2"
          />
          <button type="submit" className="admin-button admin-button--quiet">
            Search
          </button>
        </form>
      </div>

      {shown.length === 0 ? (
        <EmptyState filter={filter} query={query} total={leads.length} />
      ) : (
        <ol className="divide-y divide-white/10">
          {shown.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </ol>
      )}
    </main>
  );
}

function matches(lead: Lead, query: string) {
  const needle = query.toLowerCase();
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.message,
    lead.source,
    lead.campaign,
    lead.city,
    ...lead.services,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function LeadRow({ lead }: { lead: Lead }) {
  const firstName = lead.name.split(" ")[0];
  return (
    <li className="grid gap-5 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
      <article aria-labelledby={`lead-${lead.id}`} className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2
            id={`lead-${lead.id}`}
            className="font-heading text-xl font-medium tracking-tight"
          >
            {lead.name}
          </h2>
          <time dateTime={lead.createdAt} className="text-sm text-white/55">
            {received.format(new Date(lead.createdAt))}
          </time>
        </div>

        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
          {lead.email && (
            <li>
              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent("Your enquiry to Bellops")}`}
                className="admin-link"
              >
                {lead.email}
              </a>
            </li>
          )}
          {lead.phone && (
            <>
              <li>
                <a href={callHref(lead.phone)} className="admin-link">
                  {lead.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref(
                    lead.phone,
                    `Hi ${firstName}, this is Bellops, following up on your enquiry.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-link"
                >
                  WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </>
          )}
        </ul>

        <dl className="mt-4 grid gap-1.5 text-sm">
          {lead.services.length > 0 && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white/55">Needs</dt>
              <dd>{lead.services.join(", ")}</dd>
            </div>
          )}
          {lead.budget && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white/55">Budget</dt>
              <dd>{lead.budget}</dd>
            </div>
          )}
          {lead.source && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white/55">Came from</dt>
              <dd>
                {lead.source}
                {lead.campaign && ` (campaign: ${lead.campaign})`}
              </dd>
            </div>
          )}
          {lead.city && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white/55">Location</dt>
              <dd>{lead.city}</dd>
            </div>
          )}
          {lead.device && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-white/55">Device</dt>
              <dd>{lead.device}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 max-w-[70ch] whitespace-pre-line text-white/90">
          {lead.message}
        </p>
      </article>

      <LeadControls id={lead.id} name={lead.name} status={lead.status} />
    </li>
  );
}

function EmptyState({
  filter,
  query,
  total,
}: {
  filter: LeadStatus | null;
  query: string;
  total: number;
}) {
  if (total === 0)
    return (
      <p className="py-16 text-white/65">
        No enquiries yet. They appear here as soon as someone sends the contact
        form on the website.
      </p>
    );
  return (
    <p className="py-16 text-white/65">
      No {filter ? `${statusLabels[filter].toLowerCase()} ` : ""}enquiries
      {query ? ` match “${query}”` : ""}.{" "}
      <Link href="/admin" className="admin-link">
        Show all enquiries
      </Link>
    </p>
  );
}
