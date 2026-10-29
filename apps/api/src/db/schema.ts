import { bigserial, date, integer, jsonb, pgTable, text, time, timestamp } from "drizzle-orm/pg-core";
import type { BookingStatus, CancellationPolicy } from "@shared/booking";

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  // IANA-пояс об'єкта, напр. "Europe/Kyiv"
  timezone: text("timezone").notNull(),
  // час заїзду за місцевим часом об'єкта, "HH:mm:ss"
  checkInTime: time("check_in_time").notNull(),
  cancellationPolicy: text("cancellation_policy").$type<CancellationPolicy>().notNull(),
  nightlyRateMinor: integer("nightly_rate_minor").notNull(),
  currency: text("currency").notNull(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id),
  guestEmail: text("guest_email").notNull(),
  // політика фіксується в момент бронювання
  policy: text("policy").$type<CancellationPolicy>().notNull(),
  // дата заїзду за місцевим часом об'єкта, "YYYY-MM-DD"
  checkInDate: date("check_in_date", { mode: "string" }).notNull(),
  nights: integer("nights").notNull(),
  // суми — у мінорних одиницях (копійки, центи)
  accommodationMinor: integer("accommodation_minor").notNull(),
  serviceFeeMinor: integer("service_fee_minor").notNull(),
  currency: text("currency").notNull(),
  paymentId: text("payment_id").notNull(),
  status: text("status").$type<BookingStatus>().notNull().default("confirmed"),
  refundAmountMinor: integer("refund_amount_minor"),
  refundId: text("refund_id"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Outbox: сервіс нотифікацій читає події звідси.
export const events = pgTable("events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
