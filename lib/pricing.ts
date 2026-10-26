import type { Price } from "./content";

/**
 * Rupee amounts as people in India say them: ₹50,000, ₹1 lakh, ₹1.5 lakh.
 */
export function formatInr(amount: number) {
  if (amount >= 100_000) {
    const lakh = Math.round((amount / 100_000) * 100) / 100;
    return `₹${lakh} lakh`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** A service's starting price, as shown on its card and page. */
export function formatPrice(price: Price) {
  const per = price.per ? `/${price.per}` : "";
  const extra = price.extra ? ` + ${price.extra}` : "";
  return `From ${formatInr(price.from)}${per}${extra}`;
}

/** A starting price without the "From": "₹50,000", "₹15,000/month". */
export function formatRate(price: Price) {
  return `${formatInr(price.from)}${price.per ? `/${price.per}` : ""}`;
}
