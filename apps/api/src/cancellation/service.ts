import type { Db } from "../db";
import { ConflictError } from "../errors";
import { eventPublisher } from "../events/publish";
import type { PayLinkClient } from "../payments/paylink";
import type { Booking } from "../types";
import { calculateRefund } from "./refund";

export function cancellationService(
  db: Db,
  payLink: Pick<PayLinkClient, "refunds">,
  clock: () => Date = () => new Date(),
) {
  const { bookings, properties } = db;
  const publishEvent = eventPublisher(db);

  return {
    async cancelBooking(bookingId: string): Promise<Booking> {
      const booking = await bookings.findById(bookingId);
      if (booking.status !== "confirmed") {
        throw new ConflictError(`Бронювання ${booking.id} уже має статус ${booking.status}`);
      }
      const property = await properties.findById(booking.propertyId);
      const now = clock();

      const decision = calculateRefund(booking, property, now);
      await bookings.markCancelled(booking.id, {
        cancelledAt: now,
        refundAmountMinor: decision.amountMinor,
      });

      if (decision.amountMinor > 0) {
        const refund = await payLink.refunds.create({
          paymentId: booking.paymentId,
          amountMinor: decision.amountMinor,
          idempotencyKey: `cancel-${booking.id}`,
        });
        await bookings.markRefunded(booking.id, refund.id);
      }
      await publishEvent("booking.cancelled", { bookingId: booking.id });

      return bookings.findById(booking.id);
    },
  };
}
