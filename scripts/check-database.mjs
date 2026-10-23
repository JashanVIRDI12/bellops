// Checks the Supabase connection for the contact form and admin portal.
// Run: pnpm db:check   (reads .env.local)
// It reads and writes nothing except one rate-limit counter.

const url = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/+$/, "");
const key =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const ok = (text) => console.log(`  ✓ ${text}`);
const fail = (text, fix) => {
  console.log(`  ✗ ${text}\n\n  ${fix}\n`);
  process.exit(1);
};

console.log("\nChecking Supabase…\n");

if (!url || !key)
  fail(
    "SUPABASE_URL or SUPABASE_SECRET_KEY is missing from .env.local.",
    "In Supabase, copy the Project URL from the Connect dialog and the secret key from Settings → API Keys.",
  );
if (key.startsWith("sb_publishable_"))
  fail(
    "SUPABASE_SECRET_KEY holds the publishable key.",
    "Use the secret key instead: it starts with sb_secret_.",
  );
ok(`Project: ${url}`);

const headers = {
  apikey: key,
  ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }),
  "Content-Type": "application/json",
};

async function call(path, init) {
  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      headers,
      ...init,
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } catch (error) {
    fail(
      `Couldn't reach Supabase (${error.message}).`,
      "Check SUPABASE_URL: it looks like https://<project>.supabase.co",
    );
  }
}

const leads = await call("leads?select=id&limit=1");
if (leads.status === 401 || leads.status === 403)
  fail("Supabase rejected the key.", "Check SUPABASE_SECRET_KEY.");
if (leads.status !== 200)
  fail(
    `The leads table isn't ready (${leads.body.code ?? leads.status}: ${leads.body.message ?? ""}).`,
    "In Supabase → SQL Editor, paste supabase/schema.sql and press Run.",
  );
ok("Enquiries table is ready");

const limit = await call("rpc/count_attempt", {
  method: "POST",
  body: JSON.stringify({ attempt_key: "setup-check", window_seconds: 60 }),
});
if (limit.status !== 200)
  fail(
    `The rate-limit function isn't ready (${limit.body.code ?? limit.status}).`,
    "In Supabase → SQL Editor, paste supabase/schema.sql and press Run.",
  );
ok("Spam and sign-in limits are ready");

console.log(
  "\nAll set. Enquiries from the website will be saved in Supabase.\n",
);
