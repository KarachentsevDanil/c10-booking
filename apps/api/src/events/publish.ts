import type { Db } from "../db";

export type EventType = "booking.created";

/** Публікує подію в outbox; сервіс нотифікацій забирає її звідти. */
export function eventPublisher(db: Db) {
  return async function publishEvent(type: EventType, payload: Record<string, unknown>): Promise<void> {
    await db.events.insert(type, payload);
  };
}
