import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { config } from "../config";

export const migrationsFolder = path.resolve(__dirname, "../../drizzle");

export async function runMigrations(pool: Pool): Promise<void> {
  await migrate(drizzle(pool), { migrationsFolder });
}

if (require.main === module) {
  const pool = new Pool({ connectionString: config.databaseUrl });
  runMigrations(pool)
    .then(() => console.log("migrations: ok"))
    .catch((err: unknown) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => void pool.end());
}
