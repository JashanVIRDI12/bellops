import { services, site, workPage } from "./content";

/**
 * Country code added to numbers typed without one (for example a 10-digit
 * Indian mobile number in an enquiry). Change it if most clients are elsewhere.
 */
export const DEFAULT_COUNTRY_CODE = "91";

/** Digits only, with the country code: the form wa.me and tel: links need. */
export function internationalDigits(phone: string) {
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("00")) digits = digits.slice(2);
  else if (!trimmed.startsWith("+")) {
    digits = digits.replace(/^0+/, "");
    if (digits.length === 10) digits = DEFAULT_COUNTRY_CODE + digits;
  }
  return digits;
}

/** A tel: link, for numbers visitors leave in enquiries (the site has no call button). */
export function callHref(phone: string) {
  return `tel:+${internationalDigits(phone)}`;
}

/**
 * Opens a WhatsApp chat, with a message typed in and ready to send: by
 * default, a quote request for the visitor's project.
 */
export function whatsappHref(
  phone: string = site.whatsapp,
  text: string | undefined = site.whatsappQuote,
) {
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${internationalDigits(phone)}${query}`;
}

/** "Landing pages" -> "landing pages"; names like Google or SEO stay as they are. */
export const midSentence = (title: string) =>
  /^[A-Z][a-z]/.test(title) && !title.startsWith("Google")
    ? title[0]!.toLowerCase() + title.slice(1)
    : title;

/**
 * WhatsApp for one service: "Hi Bellops, I'd like a quote for landing pages
 * (from ₹20,000)." `price` is the label shown on the page ("From ₹20,000").
 */
export function serviceWhatsappHref(name: string, price: string) {
  return whatsappHref(
    site.whatsapp,
    services.whatsappMessage
      .replace("{service}", midSentence(name))
      .replace("{price}", price.replace(/^From /, "from ")),
  );
}

/** The tracking name for a service's WhatsApp links: whatsapp-service-landing-pages. */
export const serviceWhatsappTrack = (path: string) =>
  `whatsapp-service-${path.replace(/^\//, "")}`;

/** WhatsApp from a case study: "I saw the {client} case study and want something similar." */
export const caseStudyWhatsappHref = (client: string) =>
  whatsappHref(
    site.whatsapp,
    workPage.whatsappMessage.replace("{name}", client),
  );
