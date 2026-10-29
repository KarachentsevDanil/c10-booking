import type { InferSelectModel } from "drizzle-orm";
import type { bookings, properties } from "./db/schema";

export type { BookingStatus, CancellationPolicy } from "@shared/booking";

export type Property = InferSelectModel<typeof properties>;
export type Booking = InferSelectModel<typeof bookings>;
