import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

/*
 * One shared admin password (ADMIN_PASSWORD), and a signed, http-only cookie
 * that keeps the admin signed in. Sessions are signed with
 * ADMIN_SESSION_SECRET, or with a key derived from the password when that
 * isn't set, so changing the password signs every device out.
 */

export const SESSION_COOKIE = "bellops_admin";
export const SESSION_PATH = "/admin"; // the cookie never reaches the public site
export const SESSION_DAYS = 7; // Tweakable: how long a sign-in lasts

function signingKey() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return (
    process.env.ADMIN_SESSION_SECRET ||
    createHash("sha256").update(`bellops-admin-session:${password}`).digest()
  );
}

/** Compares in constant time, so response timing can't reveal the answer. */
function sameText(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

function sign(payload: string, key: string | Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordMatches(attempt: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && sameText(attempt, password!);
}

/** A cookie value: expiry time, then its signature. */
export function createSessionToken() {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD is not set.");
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${expires}.${sign(expires, key)}`;
}

export async function isAdmin() {
  // Read the cookie first, even when the portal is off: it marks the page as
  // per-request, so the build can never bake a signed-out page into the site.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const key = signingKey();
  if (!key) return false;
  const [expires, signature] = token?.split(".") ?? [];
  if (!expires || !signature || !sameText(signature, sign(expires, key)))
    return false;
  return Number(expires) > Date.now();
}

/**
 * Call at the top of every admin page. Pages render per request from here on
 * (they compare times with the clock); actions and routes call isAdmin().
 */
export async function requireAdmin() {
  await connection();
  if (!(await isAdmin())) redirect("/admin/login");
}
