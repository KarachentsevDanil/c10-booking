import { randomUUID } from "node:crypto";
import { toPropertyInstant } from "@shared/time";
import type { Db } from "../db";
import { ValidationError } from "../errors";
import { eventPublisher } from "../events/publish";
import type { PayLinkClient } from "../payments/paylink";
import type { Booking } from "../types";

// Сервісний збір платформи: 12,5% від вартості проживання.
export const SERVICE_FEE_RATE = 0.125;

export type CreateBookingInput = {
  propertyId: string;
  checkInDate: string;
  nights: number;
  guestEmail: string;
};

export function bookingService(
  db: Db,
  payLink: Pick<PayLinkClient, "payments">,
  clock: () => Date = () => new Date(),
) {
  const publishEvent = eventPublisher(db);

  return {
    async createBooking(input: CreateBookingInput): Promise<Booking> {
      const property = await db.properties.findById(input.propertyId);
      const checkIn = toPropertyInstant(input.checkInDate, property.checkInTime, property.timezone);
      if (checkIn.getTime() <= clock().getTime()) {
        throw new ValidationError("Час заїзду вже минув");
      }

      const accommodationMinor = property.nightlyRateMinor * input.nights;
      const serviceFeeMinor = Math.round(accommodationMinor * SERVICE_FEE_RATE);
      const id = `bk_${randomUUID().slice(0, 8)}`;

      const payment = await payLink.payments.create({
        amountMinor: accommodationMinor + serviceFeeMinor,
        currency: property.currency,
        description: `${property.name}, заїзд ${input.checkInDate}`,
        idempotencyKey: `book-${id}`,
      });

      const booking = await db.bookings.insert({
        id,
        propertyId: property.id,
        guestEmail: input.guestEmail,
        policy: property.cancellationPolicy,
        checkInDate: input.checkInDate,
        nights: input.nights,
        accommodationMinor,
        serviceFeeMinor,
        currency: property.currency,
        paymentId: payment.id,
      });
      await publishEvent("booking.created", { bookingId: booking.id });
      return booking;
    },
  };
}
