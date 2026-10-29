import { expect, type Page } from "@playwright/test";

// Об'єкти із seed (apps/api/src/db/seed.ts).
export const KYIV_FLEXIBLE = { id: "pr_kyiv_podil", timezone: "Europe/Kyiv", nightlyRateMinor: 420000 };
export const KYIV_STRICT = { id: "pr_vorokhta_house", timezone: "Europe/Kyiv", nightlyRateMinor: 350000 };
export const NEW_YORK_FLEXIBLE = { id: "pr_brooklyn_loft", timezone: "America/New_York", nightlyRateMinor: 18000 };
export const NEW_YORK_STRICT = { id: "pr_midtown_studio", timezone: "America/New_York", nightlyRateMinor: 22000 };

/** Дата "YYYY-MM-DD" через days днів за місцевим часом об'єкта. */
export function daysFromNow(days: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "8 400,00 грн" із будь-якими пробілами-роздільниками. */
export function money(amountMinor: number, suffix: string): RegExp {
  const [int, frac] = (amountMinor / 100).toFixed(2).split(".");
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\s");
  return new RegExp(`^${grouped},${frac}\\s${suffix}$`);
}

export async function bookProperty(
  page: Page,
  property: { id: string; timezone: string },
  { checkInInDays, nights = 2 }: { checkInInDays: number; nights?: number },
): Promise<void> {
  await page.goto(`/properties/${property.id}`);
  await page.getByLabel("Дата заїзду").fill(daysFromNow(checkInInDays, property.timezone));
  await page.getByLabel("Ночей").fill(String(nights));
  await page.getByRole("button", { name: "Забронювати" }).click();
  await expect(page.getByTestId("booking-status")).toHaveText("Підтверджено");
}
