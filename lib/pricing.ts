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
