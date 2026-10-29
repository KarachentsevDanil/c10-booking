const CURRENCY_SUFFIX: Record<string, string> = { UAH: "грн", USD: "USD" };

/** 840000, "UAH" → "8 400,00 грн" */
export function formatMinor(amountMinor: number, currency: string): string {
  const value = (amountMinor / 100).toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value} ${CURRENCY_SUFFIX[currency] ?? currency}`;
}
