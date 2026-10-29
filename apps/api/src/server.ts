import { captureException } from "./instrument";
import { Pool } from "pg";
import { config } from "./config";
import { createDb } from "./db";
import { buildApp } from "./http/app";
import { createPayLinkClient } from "./payments/paylink";

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: config.databaseUrl });
  const app = buildApp({
    db: createDb(pool),
    payLink: createPayLinkClient(config.payLink),
    webhookSecret: config.payLink.webhookSecret,
    onError: captureException,
  });
  app.addHook("onClose", async () => pool.end());
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
