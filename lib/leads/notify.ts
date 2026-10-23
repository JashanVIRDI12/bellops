import "server-only";
import { siteUrl } from "@/lib/seo";
import type { Lead } from "./types";

/**
 * Optional: emails each new enquiry through Resend (resend.com), so leads
 * don't wait for someone to open /admin. Set RESEND_API_KEY and
 * LEADS_NOTIFY_TO to turn it on; without them, this does nothing.
 */
export async function notifyNewLead(lead: Lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_TO;
  if (!apiKey || !to) return;

  const details = [
    lead.email && `Email: ${lead.email}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.services.length > 0 && `Needs: ${lead.services.join(", ")}`,
    lead.budget && `Budget: ${lead.budget}`,
  ].filter(Boolean);
  const text = [
    `New enquiry from ${lead.name}`,
    "",
    ...details,
    "",
    lead.message,
    "",
    `Open the admin portal: ${siteUrl}/admin`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Resend's test sender only delivers to your own account's address.
      // Verify your domain in Resend and set LEADS_NOTIFY_FROM to use your own.
      from:
        process.env.LEADS_NOTIFY_FROM ||
        "Bellops website <onboarding@resend.dev>",
      to: to.split(",").map((address) => address.trim()),
      subject: `New enquiry from ${lead.name}`,
      text,
      ...(lead.email ? { reply_to: lead.email } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new Error(`Resend rejected the email (${response.status})`);
}
