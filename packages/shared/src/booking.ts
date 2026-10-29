// Спільні типи бронювання для apps/api і apps/web.

export type CancellationPolicy = "flexible" | "strict";

export type BookingStatus = "confirmed" | "cancelled" | "refunded";
