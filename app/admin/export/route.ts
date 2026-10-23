import { isAdmin } from "@/lib/admin/session";
import { listLeads } from "@/lib/leads/store";
import { statusLabels } from "@/lib/leads/types";

/** Downloads every enquiry as a spreadsheet-friendly CSV file. */
export async function GET() {
  if (!(await isAdmin()))
    return new Response("Sign in at /admin/login first.", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });

  const leads = await listLeads();
  const rows = [
    [
      "Received",
      "Status",
      "Name",
      "Email",
      "Phone",
      "Needs",
      "Budget",
      "Message",
      "Came from",
      "Campaign",
      "Location",
      "Device",
    ],
    ...leads.map((lead) => [
      lead.createdAt,
      statusLabels[lead.status],
      lead.name,
      lead.email,
      lead.phone,
      lead.services.join("; "),
      lead.budget,
      lead.message,
      lead.source,
      lead.campaign,
      lead.city,
      lead.device,
    ]),
  ];
  // The byte-order mark makes Excel read ₹ and other characters correctly.
  const csv = "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bellops-enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Quotes a value, and stops spreadsheets running text that looks like a formula. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
