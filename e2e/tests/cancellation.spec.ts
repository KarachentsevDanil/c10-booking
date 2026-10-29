import { expect, test } from "@playwright/test";
import { bookProperty, KYIV_FLEXIBLE, KYIV_STRICT, money, NEW_YORK_FLEXIBLE, NEW_YORK_STRICT } from "./helpers";

test.describe("скасування бронювання", () => {
  test("гість скасовує бронювання з flexible за 10 днів до заїзду: 100% вартості проживання", async ({ page }) => {
    await bookProperty(page, KYIV_FLEXIBLE, { checkInInDays: 10, nights: 2 });

    await page.getByRole("button", { name: "Скасувати бронювання" }).click();

    await expect(page.getByTestId("booking-status")).toHaveText("Скасовано, кошти повернено");
    await expect(page.getByTestId("refund-amount")).toHaveText(money(2 * KYIV_FLEXIBLE.nightlyRateMinor, "грн"));
  });

  test("гість скасовує бронювання з strict за 10 днів до заїзду: 50% вартості проживання", async ({ page }) => {
    await bookProperty(page, KYIV_STRICT, { checkInInDays: 10, nights: 2 });

    await page.getByRole("button", { name: "Скасувати бронювання" }).click();

    await expect(page.getByTestId("booking-status")).toHaveText("Скасовано, кошти повернено");
    await expect(page.getByTestId("refund-amount")).toHaveText(money(KYIV_STRICT.nightlyRateMinor, "грн"));
  });

  test("гість скасовує бронювання з strict за 3 дні до заїзду: без повернення", async ({ page }) => {
    await bookProperty(page, NEW_YORK_STRICT, { checkInInDays: 3, nights: 1 });

    await page.getByRole("button", { name: "Скасувати бронювання" }).click();

    await expect(page.getByTestId("booking-status")).toHaveText("Скасовано");
    await expect(page.getByTestId("refund-amount")).toHaveText(money(0, "USD"));
  });

  test("гість у New York скасовує бронювання з flexible за 5 днів до заїзду: 100%", async ({ page }) => {
    await bookProperty(page, NEW_YORK_FLEXIBLE, { checkInInDays: 5, nights: 3 });

    await page.getByRole("button", { name: "Скасувати бронювання" }).click();

    await expect(page.getByTestId("booking-status")).toHaveText("Скасовано, кошти повернено");
    await expect(page.getByTestId("refund-amount")).toHaveText(money(3 * NEW_YORK_FLEXIBLE.nightlyRateMinor, "USD"));
  });
});
