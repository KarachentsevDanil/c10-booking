import { createHmac, timingSafeEqual } from "node:crypto";
import type { Db } from "../db";

export type PayLinkWebhookEvent = {
  type: string;
  paymentId?: string;
  refundId?: string;
};

export type Logger = {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
};

const consoleLogger: Logger = {
  info: (obj, msg) => console.info(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
};

export async function handlePayLinkWebhook(
  db: Db,
  event: PayLinkWebhookEvent,
  log: Logger = consoleLogger,
): Promise<void> {
  if (event.type.startsWith("refund.")) {
    log.info({ event }, "paylink: refund event");
    return;
  }
  log.warn({ event }, "paylink: unhandled event type");
}

/** Підпис PayLink: hex HMAC-SHA256 від сирого тіла запиту. */
export function verifyPayLinkSignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
