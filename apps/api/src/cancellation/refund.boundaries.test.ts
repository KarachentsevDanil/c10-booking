import { makeBooking } from "../testing/factories";
import { calculateRefund } from "./refund";

const property = { timezone: "Europe/Kyiv", checkInTime: "15:00:00" };

it("flexible: 0, якщо до заїзду за місцевим часом менше 24 год", () => {
  const booking = makeBooking({
    policy: "flexible",
    checkInDate: "2026-10-04",
    accommodationMinor: 840000,
  });
  // заїзд 04.10 о 15:00 за Києвом (12:00 UTC); до заїзду 23 год
  const cancelledAt = new Date("2026-10-03T13:00:00Z");
  expect(calculateRefund(booking, property, cancelledAt).share).toBe(0);
});

// Межі рахуються від часу заїзду за місцевим часом об'єкта.
// Скасування — за годину до межі й через годину після неї.
const kyiv = { timezone: "Europe/Kyiv", checkInTime: "15:00:00" }; // 04.10 15:00 = 12:00 UTC
const newYork = { timezone: "America/New_York", checkInTime: "16:00:00" }; // 04.10 16:00 = 20:00 UTC

describe.each([
  // policy, об'єкт, скасовано (UTC), до заїзду, очікувана частка
  ["flexible", "Kyiv", kyiv, "2026-10-03T11:00:00Z", "25 год", 1],
  ["flexible", "Kyiv", kyiv, "2026-10-03T13:00:00Z", "23 год", 0],
  ["flexible", "New York", newYork, "2026-10-03T19:00:00Z", "25 год", 1],
  ["flexible", "New York", newYork, "2026-10-03T21:00:00Z", "23 год", 0],
  ["strict", "Kyiv", kyiv, "2026-09-27T11:00:00Z", "7 днів 1 год", 0.5],
  ["strict", "Kyiv", kyiv, "2026-09-27T13:00:00Z", "6 днів 23 год", 0],
  ["strict", "New York", newYork, "2026-09-27T19:00:00Z", "7 днів 1 год", 0.5],
  ["strict", "New York", newYork, "2026-09-27T21:00:00Z", "6 днів 23 год", 0],
  ["moderate", "Kyiv", kyiv, "2026-10-02T11:00:00Z", "49 год", 1],
  ["moderate", "Kyiv", kyiv, "2026-10-02T13:00:00Z", "47 год", 0.5],
  ["moderate", "Kyiv", kyiv, "2026-10-04T11:00:00Z", "1 год", 0.5],
  ["moderate", "Kyiv", kyiv, "2026-10-04T13:00:00Z", "−1 год (після заїзду)", 0],
  ["moderate", "New York", newYork, "2026-10-02T19:00:00Z", "49 год", 1],
  ["moderate", "New York", newYork, "2026-10-02T21:00:00Z", "47 год", 0.5],
  ["moderate", "New York", newYork, "2026-10-04T21:00:00Z", "−1 год (після заїзду)", 0],
] as const)("%s, %s", (policy, _city, prop, cancelledAtIso, before, share) => {
  it(`скасовано ${cancelledAtIso}, до заїзду ${before} → частка ${share}`, () => {
    const booking = makeBooking({ policy, checkInDate: "2026-10-04", accommodationMinor: 840000 });
    const decision = calculateRefund(booking, prop, new Date(cancelledAtIso));
    expect(decision).toEqual({ share, amountMinor: 840000 * share });
  });
});

// «Щонайменше за N год»: рівно на межі повернення ще діє.
it.each([
  ["flexible", "2026-10-03T12:00:00Z", "24 год", 1],
  ["moderate", "2026-10-02T12:00:00Z", "48 год", 1],
  ["strict", "2026-09-27T12:00:00Z", "7 днів", 0.5],
] as const)("%s, Kyiv: рівно на межі (скасовано %s, до заїзду %s) → частка %s", (policy, cancelledAtIso, _before, share) => {
  const booking = makeBooking({ policy, checkInDate: "2026-10-04", accommodationMinor: 840000 });
  expect(calculateRefund(booking, kyiv, new Date(cancelledAtIso)).share).toBe(share);
});

it("moderate: скасування за 45,5 год до заїзду → 50%, 4 200,00 грн", () => {
  const booking = makeBooking({
    policy: "moderate",
    checkInDate: "2026-10-04",
    accommodationMinor: 840000,
    serviceFeeMinor: 105000,
  });
  // заїзд 04.10 о 15:00 за Києвом (12:00 UTC)
  const decision = calculateRefund(booking, kyiv, new Date("2026-10-02T14:30:00Z"));
  expect(decision).toEqual({ share: 0.5, amountMinor: 420000 });
});

it("сервісний збір не повертається: частка рахується лише від вартості проживання", () => {
  const booking = makeBooking({
    policy: "flexible",
    checkInDate: "2026-10-04",
    accommodationMinor: 840000,
    serviceFeeMinor: 105000,
  });
  const decision = calculateRefund(booking, kyiv, new Date("2026-09-24T12:00:00Z"));
  expect(decision.amountMinor).toBe(840000);
});
