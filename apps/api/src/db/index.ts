import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { NotFoundError } from "../errors";
import type { Booking, Property } from "../types";
import * as schema from "./schema";

export type NewBooking = Omit<
  typeof schema.bookings.$inferInsert,
  "status" | "refundAmountMinor" | "refundId" | "cancelledAt" | "createdAt"
>;

export function createDb(pool: Pool) {
  const orm = drizzle(pool, { schema });

  const properties = {
    async list(): Promise<Property[]> {
      return orm.select().from(schema.properties).orderBy(asc(schema.properties.name));
    },

    async findById(id: string): Promise<Property> {
      const [row] = await orm.select().from(schema.properties).where(eq(schema.properties.id, id));
      if (!row) throw new NotFoundError("Об'єкт", id);
      return row;
    },
  };

  const bookings = {
    async findById(id: string): Promise<Booking> {
      const [row] = await orm.select().from(schema.bookings).where(eq(schema.bookings.id, id));
      if (!row) throw new NotFoundError("Бронювання", id);
      return row;
    },

    async insert(values: NewBooking): Promise<Booking> {
      const [row] = await orm.insert(schema.bookings).values(values).returning();
      return row!;
    },

    async markCancelled(
      id: string,
      { cancelledAt, refundAmountMinor }: { cancelledAt: Date; refundAmountMinor: number },
    ): Promise<void> {
      await orm
        .update(schema.bookings)
        .set({ status: "cancelled", cancelledAt, refundAmountMinor })
        .where(eq(schema.bookings.id, id));
    },

    async markRefunded(id: string, refundId: string): Promise<void> {
      await orm
        .update(schema.bookings)
        .set({ status: "refunded", refundId })
        .where(eq(schema.bookings.id, id));
    },
  };

  const events = {
    async insert(type: string, payload: Record<string, unknown>): Promise<void> {
      await orm.insert(schema.events).values({ type, payload });
    },

    async listByType(type: string) {
      return orm
        .select()
        .from(schema.events)
        .where(eq(schema.events.type, type))
        .orderBy(asc(schema.events.id));
    },
  };

  return { orm, properties, bookings, events };
}

export type Db = ReturnType<typeof createDb>;
