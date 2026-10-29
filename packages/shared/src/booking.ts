// Спільні типи бронювання для apps/api і apps/web.

export type CancellationPolicy = "flexible" | "moderate" | "strict";

export type BookingStatus = "confirmed" | "cancelled" | "refunded";
