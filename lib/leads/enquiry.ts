"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { channelFor, parseVisit } from "@/lib/analytics/attribution";
import { deviceFrom, locationFrom } from "@/lib/analytics/request";
import { enquiryForm, services } from "@/lib/content";
import { notifyNewLead } from "./notify";
import { countAttempt, saveLead } from "./store";
import type { Lead } from "./types";

export type EnquiryField = "name" | "contact" | "email" | "phone" | "message";

export type EnquiryValues = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  budget: string;
  message: string;
};

export type EnquiryState =
  | { status: "idle" }
  | {
      status: "invalid";
      errors: Partial<Record<EnquiryField, string>>;
      values: EnquiryValues;
    }
  | { status: "failed"; reason: "busy" | "storage"; values: EnquiryValues }
  | { status: "sent"; firstName: string };

const MAX_ENQUIRIES = 5; // Tweakable: enquiries one visitor can send…
const ENQUIRY_WINDOW = 10 * 60; // …in this many seconds

const serviceTitles: string[] = services.items.map((item) => item.title);

// Invisible control characters; a paragraph keeps its line breaks.
const CONTROL = /[\u0000-\u001F\u007F]+/g;
const CONTROL_EXCEPT_NEWLINE = /[\u0000-\u0009\u000B-\u001F\u007F]/g;

/** Plain text on one line, without control characters, at most `max` long. */
function line(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "")
    .replace(CONTROL, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function paragraph(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_EXCEPT_NEWLINE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function validate(values: EnquiryValues) {
  const errors: Partial<Record<EnquiryField, string>> = {};
  if (values.name.length < 2) errors.name = "Add your name.";
  if (!values.email && !values.phone)
    errors.contact = "Add an email or a phone number so we can reply.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
    errors.email = "Check the email address, for example name@company.com.";
  const digits = values.phone.replace(/\D/g, "");
  if (
    values.phone &&
    (!/^[\d\s()+.-]+$/.test(values.phone) ||
      digits.length < 7 ||
      digits.length > 15)
  )
    errors.phone = "Check the number. Include the country code outside India.";
  return errors;
}

export async function sendEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // A field people never see. Bots fill it in; pretend it worked.
  if (line(formData.get("website"), 200))
    return { status: "sent", firstName: "" };

  const values: EnquiryValues = {
    name: line(formData.get("name"), 100),
    email: line(formData.get("email"), 200).toLowerCase(),
    phone: line(formData.get("phone"), 30),
    services: formData
      .getAll("services")
      .map(String)
      .filter((title) => serviceTitles.includes(title)),
    budget:
      enquiryForm.budgets.find((budget) => budget === formData.get("budget")) ??
      "",
    message: paragraph(formData.get("message"), 4000),
  };

  const errors = validate(values);
  if (Object.keys(errors).length > 0)
    return { status: "invalid", errors, values };

  try {
    const attempts = await countAttempt("enquiry", ENQUIRY_WINDOW);
    if (attempts > MAX_ENQUIRIES)
      return { status: "failed", reason: "busy", values };

    // Where this enquiry came from: the visit's channel and campaign (sent
    // by the page), a coarse city and the device.
    const requestHeaders = await headers();
    let visit = parseVisit(null);
    try {
      visit = parseVisit(JSON.parse(String(formData.get("visit") ?? "{}")));
    } catch {
      /* no visit details: the enquiry still counts */
    }
    const { source, campaign } = channelFor(visit);
    const place = locationFrom(requestHeaders);
    const { device, browser, os } = deviceFrom(requestHeaders);

    const now = new Date().toISOString();
    const lead: Lead = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      status: "new",
      ...values,
      source,
      campaign,
      city: [place.city, place.country].filter(Boolean).join(", "),
      device: `${device}, ${browser} on ${os}`,
      sessionId: visit.session,
    };
    await saveLead(lead);
    after(() =>
      notifyNewLead(lead).catch((error) =>
        console.error("Enquiry email failed:", error),
      ),
    );
  } catch (error) {
    console.error("Enquiry could not be saved:", error);
    return { status: "failed", reason: "storage", values };
  }

  return { status: "sent", firstName: values.name.split(" ")[0] ?? "" };
}
