import { site } from "./content";

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

/** Opens a WhatsApp chat, with an optional message typed in and ready to send. */
export function whatsappHref(
  phone: string = site.whatsapp,
  text: string | undefined = site.whatsappGreeting,
) {
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${internationalDigits(phone)}${query}`;
}
