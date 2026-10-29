import { randomUUID } from "node:crypto";
import { properties } from "@api/db/schema";
import type { Db } from "@api/db";
import type { Booking, CancellationPolicy } from "@api/types";
import { propertyDate } from "@shared/time";

type SeedBookingOptions = {
  policy: CancellationPolicy;
  checkInInDays: number;
  timezone?: string;
  checkInTime?: string;
  nightlyRateMinor?: number;
  nights?: number;
};

/** Об'єкт і підтверджене бронювання з заїздом через checkInInDays днів (за місцевим часом об'єкта). */
export async function seedBooking(db: Db, options: SeedBookingOptions): Promise<Booking> {
  const {
    policy,
    checkInInDays,
    timezone = "Europe/Kyiv",
    checkInTime = "15:00:00",
    nightlyRateMinor = 420000,
    nights = 2,
  } = options;
  const suffix = randomUUID().slice(0, 8);
  const propertyId = `pr_${suffix}`;

  await db.orm.insert(properties).values({
    id: propertyId,
    name: `Тестовий об'єкт ${suffix}`,
    city: "Київ",
    timezone,
    checkInTime,
    cancellationPolicy: policy,
    nightlyRateMinor,
    currency: "UAH",
  });

  const accommodationMinor = nightlyRateMinor * nights;
  return db.bookings.insert({
    id: `bk_${suffix}`,
    propertyId,
    guestEmail: "guest@example.com",
    policy,
    checkInDate: propertyDate(timezone, checkInInDays),
    nights,
    accommodationMinor,
    serviceFeeMinor: Math.round(accommodationMinor * 0.125),
    currency: "UAH",
    paymentId: `pay_${suffix}`,
  });
}
