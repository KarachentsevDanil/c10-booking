import type { Booking, Property, CancellationPolicy } from "../types";
import { toPropertyInstant } from "@shared/time";

const HOUR_MS = 60 * 60 * 1000;

export function calculateRefund(
  booking: Booking,
  property: Pick<Property, "timezone" | "checkInTime">,
  cancelledAt: Date,
): { amountMinor: number; share: number } {
  const checkIn = toPropertyInstant(
    booking.checkInDate,
    property.checkInTime,
    property.timezone,
  );
  const hoursBefore = (checkIn.getTime() - cancelledAt.getTime()) / HOUR_MS;
  const share = refundShare(booking.policy, hoursBefore);
  return { amountMinor: Math.round(booking.accommodationMinor * share), share };
}

function refundShare(policy: CancellationPolicy, hoursBefore: number): number {
  switch (policy) {
    case "flexible": return hoursBefore >= 24 ? 1 : 0;
    case "moderate": return hoursBefore >= 48 ? 1 : hoursBefore > 0 ? 0.5 : 0;
    case "strict":   return hoursBefore >= 7 * 24 ? 0.5 : 0;
  }
}
