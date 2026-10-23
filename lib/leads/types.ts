/** Enquiries from the contact form, as stored and shown in /admin. */

export const leadStatuses = ["new", "contacted", "won", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return leadStatuses.includes(value as LeadStatus);
}

export type Lead = {
  id: string;
  createdAt: string; // ISO time
  updatedAt: string;
  status: LeadStatus;
  name: string;
  email: string; // email or phone may be empty, never both
  phone: string;
  services: string[];
  budget: string;
  message: string;
  // Where the enquiry came from (empty for enquiries before analytics).
  source: string; // e.g. "Google Ads", "Instagram", "Direct"
  campaign: string; // the ad's utm_campaign, if tagged
  city: string; // coarse, from the IP address; the IP itself is not kept
  device: string; // e.g. "Mobile, Chrome on Android"
  sessionId: string; // links the enquiry to its visit in Analytics
};

export const LEAD_ID = /^[0-9a-f-]{36}$/;
