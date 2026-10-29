// Sentry: необроблені винятки API. Без SENTRY_DSN (локально, у тестах) нічого не вмикається.
import * as Sentry from "@sentry/node";
import { config } from "./config";

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn, environment: config.environment, tracesSampleRate: 0 });
}

export function captureException(err: unknown): void {
  if (config.sentryDsn) Sentry.captureException(err);
}
