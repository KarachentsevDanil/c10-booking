import type { Booking } from "../types";

export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "bk_test",
    propertyId: "pr_test",
    guestEmail: "guest@example.com",
    policy: "flexible",
    checkInDate: "2026-10-04",
    nights: 2,
    accommodationMinor: 840000,
    serviceFeeMinor: 105000,
    currency: "UAH",
    paymentId: "pay_test",
    status: "confirmed",
    refundAmountMinor: null,
    refundId: null,
    cancelledAt: null,
    createdAt: new Date("2026-09-01T10:00:00Z"),
    ...overrides,
  };
}
