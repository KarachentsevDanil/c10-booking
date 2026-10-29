import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { createDb, type Db } from "@api/db";
import { runMigrations } from "@api/db/migrate";

export type TestDb = { db: Db; stop: () => Promise<void> };

/** Окремий Postgres у контейнері на кожен тестовий файл. Потрібен запущений Docker. */
export async function startTestDb(): Promise<TestDb> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer("postgres:17-alpine").start();
  const pool = new Pool({ connectionString: container.getConnectionUri() });
  await runMigrations(pool);
  return {
    db: createDb(pool),
    stop: async () => {
      await pool.end();
      await container.stop();
    },
  };
}
