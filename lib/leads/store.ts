import "server-only";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { headers } from "next/headers";
import { isLeadStatus, type Lead, type LeadStatus } from "./types";

/*
 * Where enquiries are kept.
 * - Supabase, once SUPABASE_URL and SUPABASE_SECRET_KEY are set. Create the
 *   tables first with supabase/schema.sql (see the README).
 * - Otherwise a JSON file at .data/leads.json, for trying things locally.
 *   Vercel's disk is read-only, so there the form reports a failure until
 *   Supabase is connected.
 */

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/+$/, "");
// The secret key, or the older service_role key. Never the publishable key.
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const LEADS_FILE = path.join(process.cwd(), ".data", "leads.json");
const MAX_LEADS = 1000; // Supabase's default page size for one request

export type StorageKind = "supabase" | "file" | "missing";

export function storageKind(): StorageKind {
  if (SUPABASE_URL && SUPABASE_KEY) return "supabase";
  if (process.env.VERCEL === "1") return "missing";
  return "file";
}

/** `setup`: the tables don't exist yet. `key`: the key was rejected. */
export class StorageError extends Error {
  constructor(
    message: string,
    readonly reason: "missing" | "setup" | "key" | "other" = "other",
  ) {
    super(message);
  }
}

// ── Supabase (its REST API, so no client library is needed) ───────────────

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  budget: string;
  message: string;
  source?: string;
  campaign?: string;
  city?: string;
  device?: string;
  session_id?: string;
};

async function supabase<T>(
  endpoint: string,
  init: { method?: string; body?: unknown; returnRows?: boolean } = {},
): Promise<T> {
  const key = SUPABASE_KEY!;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: key,
      // The older JWT keys also go here; the new sb_secret_ keys must not.
      ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json",
      Prefer:
        init.returnRows === false ? "return=minimal" : "return=representation",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    const reason =
      response.status === 401 || response.status === 403
        ? "key"
        : error.code === "PGRST205" ||
            error.code === "PGRST202" ||
            error.code === "42P01" ||
            error.code === "42501"
          ? "setup"
          : "other";
    throw new StorageError(
      `Supabase ${response.status}: ${error.message ?? "request failed"}`,
      reason,
    );
  }
  // A save with "return=minimal" answers 201 with an empty body.
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

function fromRow(row: LeadRow): Lead | null {
  if (!row?.id || !isLeadStatus(row.status)) return null;
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    status: row.status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    services: row.services ?? [],
    budget: row.budget,
    message: row.message,
    source: row.source ?? "",
    campaign: row.campaign ?? "",
    city: row.city ?? "",
    device: row.device ?? "",
    sessionId: row.session_id ?? "",
  };
}

function toRow(lead: Lead): LeadRow {
  return {
    id: lead.id,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    services: lead.services,
    budget: lead.budget,
    message: lead.message,
    source: lead.source,
    campaign: lead.campaign,
    city: lead.city,
    device: lead.device,
    session_id: lead.sessionId,
  };
}

// ── JSON file (local development) ──────────────────────────────────────────

let fileQueue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<Record<string, Lead>> {
  try {
    return JSON.parse(await fs.readFile(LEADS_FILE, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

/** Runs one change at a time, writing through a temporary file. */
function changeFile<T>(change: (leads: Record<string, Lead>) => T) {
  const run = fileQueue.then(async () => {
    const leads = await readFile();
    const result = change(leads);
    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
    const temporary = `${LEADS_FILE}.${process.pid}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(leads, null, 2));
    await fs.rename(temporary, LEADS_FILE);
    return result;
  });
  fileQueue = run.catch(() => {});
  return run;
}

// ── Leads ───────────────────────────────────────────────────────────────────

function assertStorage() {
  if (storageKind() === "missing")
    throw new StorageError("No database is connected.", "missing");
}

export async function saveLead(lead: Lead) {
  assertStorage();
  if (storageKind() === "supabase") {
    await supabase("leads", {
      method: "POST",
      body: toRow(lead),
      returnRows: false,
    });
    return;
  }
  await changeFile((leads) => {
    leads[lead.id] = lead;
  });
}

/** Every enquiry, newest first (up to the latest 1,000). */
export async function listLeads(): Promise<Lead[]> {
  assertStorage();
  if (storageKind() === "supabase") {
    const rows = await supabase<LeadRow[]>(
      `leads?select=*&order=created_at.desc&limit=${MAX_LEADS}`,
    );
    return rows.map(fromRow).filter((lead): lead is Lead => lead !== null);
  }
  return Object.values(await readFile())
    .filter((lead) => lead?.id && isLeadStatus(lead.status))
    .map((lead) => ({
      ...lead,
      source: lead.source ?? "",
      campaign: lead.campaign ?? "",
      city: lead.city ?? "",
      device: lead.device ?? "",
      sessionId: lead.sessionId ?? "",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  assertStorage();
  const updatedAt = new Date().toISOString();
  if (storageKind() === "supabase") {
    const rows = await supabase<LeadRow[]>(
      `leads?id=eq.${encodeURIComponent(id)}&select=id`,
      { method: "PATCH", body: { status, updated_at: updatedAt } },
    );
    return rows.length > 0;
  }
  return changeFile((leads) => {
    const lead = leads[id];
    if (!lead) return false;
    leads[id] = { ...lead, status, updatedAt };
    return true;
  });
}

export async function deleteLead(id: string) {
  assertStorage();
  if (storageKind() === "supabase") {
    const rows = await supabase<LeadRow[]>(
      `leads?id=eq.${encodeURIComponent(id)}&select=id`,
      { method: "DELETE" },
    );
    return rows.length > 0;
  }
  return changeFile((leads) => {
    if (!leads[id]) return false;
    delete leads[id];
    return true;
  });
}

// ── Analytics (Supabase only) ───────────────────────────────────────────────

/** One stored analytics event; see analytics_events in supabase/schema.sql. */
export type AnalyticsRow = {
  session_id: string;
  visitor_id: string;
  type: "pageview" | "section" | "action" | "vitals" | "engagement";
  name: string;
  value: number | null;
  path: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  screen: string;
  language: string;
  scene: string;
};

export async function saveEvents(rows: AnalyticsRow[]) {
  if (storageKind() !== "supabase" || rows.length === 0) return;
  await supabase("analytics_events", {
    method: "POST",
    body: rows,
    returnRows: false,
  });
}

/** Everything the Analytics page shows; the shape is built in SQL. */
export async function analyticsSummary(since: Date, until: Date, zone: string) {
  if (storageKind() !== "supabase")
    throw new StorageError("Analytics needs Supabase.", "missing");
  return supabase<AnalyticsSummary>("rpc/analytics_summary", {
    method: "POST",
    body: {
      since: since.toISOString(),
      until: until.toISOString(),
      zone,
    },
  });
}

/** Raw events for the CSV export, oldest first, in pages of 1,000. */
export async function listEvents(since: Date, until: Date, limit = 20000) {
  const rows: (AnalyticsRow & { created_at: string })[] = [];
  for (let offset = 0; offset < limit; offset += 1000) {
    const page = await supabase<(AnalyticsRow & { created_at: string })[]>(
      `analytics_events?select=*&created_at=gte.${encodeURIComponent(since.toISOString())}` +
        `&created_at=lt.${encodeURIComponent(until.toISOString())}` +
        `&order=id.asc&limit=1000&offset=${offset}`,
    );
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

type Ranked = { label: string; sessions: number; contacts: number };

export type AnalyticsSummary = {
  totals: {
    visitors: number;
    sessions: number;
    pageviews: number;
    engagedSeconds: number;
    engagedSessions: number;
    contactSessions: number;
    whatsapp: number;
    calls: number;
    emails: number;
    enquiries: number;
  };
  daily: {
    day: string;
    visitors: number;
    sessions: number;
    contacts: number;
  }[];
  sources: Ranked[];
  campaigns: Ranked[];
  referrers: Ranked[];
  cities: Ranked[];
  devices: Ranked[];
  browsers: Ranked[];
  sections: { name: string; sessions: number }[];
  actions: { name: string; count: number }[];
  vitals: Record<string, { p75: number; samples: number }>;
  scenes: { label: string; sessions: number }[];
  recent: {
    started_at: string;
    source: string;
    campaign: string;
    referrer: string;
    city: string;
    country: string;
    device: string;
    browser: string;
    os: string;
    engaged: number;
    pageviews: number;
    furthest: string | null;
    actions: string[];
  }[];
  live: number;
};

// ── Rate limits ─────────────────────────────────────────────────────────────

const memoryHits = new Map<string, { count: number; resetAt: number }>();

/**
 * Counts attempts by this visitor in a time window and returns the new total.
 * Visitors are told apart by a one-way hash of their IP; raw IPs are never kept.
 */
export async function countAttempt(bucket: string, windowSeconds: number) {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown";
  const visitor = createHash("sha256")
    .update(`bellops:${ip}`)
    .digest("hex")
    .slice(0, 20);
  const key = `${bucket}:${visitor}`;

  if (storageKind() === "supabase") {
    return supabase<number>("rpc/count_attempt", {
      method: "POST",
      body: { attempt_key: key, window_seconds: windowSeconds },
    });
  }
  const now = Date.now();
  if (memoryHits.size > 2000) {
    for (const [stale, value] of memoryHits)
      if (value.resetAt < now) memoryHits.delete(stale);
  }
  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt < now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}
