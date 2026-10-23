"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  SESSION_PATH,
  adminConfigured,
  createSessionToken,
  isAdmin,
  passwordMatches,
} from "@/lib/admin/session";
import { countAttempt, deleteLead, setLeadStatus } from "@/lib/leads/store";
import { LEAD_ID, isLeadStatus } from "@/lib/leads/types";

// Every action checks the session itself: the portal's pages hiding a button
// doesn't stop someone calling the action directly.

const MAX_SIGN_IN_ATTEMPTS = 8; // Tweakable: wrong passwords allowed…
const SIGN_IN_WINDOW = 15 * 60; // …per this many seconds, per connection

export type SignInState = { error?: string };

export async function signIn(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!adminConfigured())
    return {
      error:
        "The admin portal is switched off. Set ADMIN_PASSWORD on the server, then redeploy.",
    };

  const attempts = await countAttempt("sign-in", SIGN_IN_WINDOW).catch(() => 0);
  if (attempts > MAX_SIGN_IN_ATTEMPTS)
    return { error: "Too many attempts. Try again in 15 minutes." };

  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { error: "That password isn't right." };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: SESSION_PATH,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/admin");
}

export async function signOut() {
  (await cookies()).set(SESSION_COOKIE, "", {
    path: SESSION_PATH,
    maxAge: 0,
  });
  redirect("/admin/login");
}

export type LeadActionResult = { ok: true } | { ok: false; error: string };

const signedOut: LeadActionResult = {
  ok: false,
  error: "You've been signed out. Reload the page and sign in again.",
};

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<LeadActionResult> {
  if (!(await isAdmin())) return signedOut;
  if (!LEAD_ID.test(id) || !isLeadStatus(status))
    return { ok: false, error: "That change isn't valid." };
  try {
    if (!(await setLeadStatus(id, status)))
      return { ok: false, error: "This enquiry no longer exists." };
  } catch {
    return { ok: false, error: "The status didn't save. Try again." };
  }
  refresh();
  return { ok: true };
}

export async function removeLead(id: string): Promise<LeadActionResult> {
  if (!(await isAdmin())) return signedOut;
  if (!LEAD_ID.test(id))
    return { ok: false, error: "That change isn't valid." };
  try {
    await deleteLead(id);
  } catch {
    return { ok: false, error: "The enquiry wasn't deleted. Try again." };
  }
  refresh();
  return { ok: true };
}
