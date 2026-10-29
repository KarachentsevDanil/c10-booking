// Значення за замовчуванням — для локальної розробки (docker compose + tools/paylink-sandbox).
export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://booking:booking@localhost:5432/booking",
  payLink: {
    baseUrl: process.env.PAYLINK_BASE_URL ?? "http://localhost:4010",
    apiKey: process.env.PAYLINK_API_KEY ?? "sk_sandbox_local",
    webhookSecret: process.env.PAYLINK_WEBHOOK_SECRET ?? "whsec_local",
  },
  sentryDsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV ?? "local",
};
