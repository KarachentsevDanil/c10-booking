import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config";
import { properties } from "./schema";

// Об'єкти для локальної розробки й e2e.
export const seedProperties: (typeof properties.$inferInsert)[] = [
  {
    id: "pr_kyiv_podil",
    name: "Квартира на Подолі",
    city: "Київ",
    timezone: "Europe/Kyiv",
    checkInTime: "15:00:00",
    cancellationPolicy: "flexible",
    nightlyRateMinor: 420000,
    currency: "UAH",
  },
  {
    id: "pr_vorokhta_house",
    name: "Будинок у Ворохті",
    city: "Ворохта",
    timezone: "Europe/Kyiv",
    checkInTime: "14:00:00",
    cancellationPolicy: "strict",
    nightlyRateMinor: 350000,
    currency: "UAH",
  },
  {
    id: "pr_brooklyn_loft",
    name: "Brooklyn Loft",
    city: "New York",
    timezone: "America/New_York",
    checkInTime: "16:00:00",
    cancellationPolicy: "flexible",
    nightlyRateMinor: 18000,
    currency: "USD",
  },
  {
    id: "pr_midtown_studio",
    name: "Midtown Studio",
    city: "New York",
    timezone: "America/New_York",
    checkInTime: "15:00:00",
    cancellationPolicy: "strict",
    nightlyRateMinor: 22000,
    currency: "USD",
  },
];

if (require.main === module) {
  const pool = new Pool({ connectionString: config.databaseUrl });
  drizzle(pool)
    .insert(properties)
    .values(seedProperties)
    .onConflictDoNothing()
    .then(() => console.log(`seed: ${seedProperties.length} properties`))
    .catch((err: unknown) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => void pool.end());
}
