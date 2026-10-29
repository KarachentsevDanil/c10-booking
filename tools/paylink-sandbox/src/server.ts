// Локальна заміна sandbox PayLink для розробки й e2e.
// Поводиться як sandbox провайдера: платежі й повернення підтверджуються одразу.
import { randomUUID } from "node:crypto";
import Fastify from "fastify";

const port = Number(process.env.PAYLINK_SANDBOX_PORT ?? 4010);
const app = Fastify({ logger: true });

// Відповіді за ідемпотентним ключем: повторний запит отримує ту саму відповідь.
const byIdempotencyKey = new Map<string, unknown>();

function idempotent<T>(key: string | undefined, create: () => T): T {
  if (!key) return create();
  if (!byIdempotencyKey.has(key)) byIdempotencyKey.set(key, create());
  return byIdempotencyKey.get(key) as T;
}

app.get("/health", async () => ({ ok: true }));

app.post<{ Body: { amountMinor: number; currency: string } }>("/v1/payments", async (req) => {
  const key = req.headers["idempotency-key"] as string | undefined;
  return idempotent(key, () => ({ id: `pay_${randomUUID().slice(0, 12)}`, status: "succeeded" }));
});

app.post<{ Body: { paymentId: string; amountMinor: number } }>("/v1/refunds", async (req, reply) => {
  if (!Number.isInteger(req.body.amountMinor) || req.body.amountMinor <= 0) {
    return reply.code(422).send({ code: "invalid_amount", message: "amountMinor має бути цілим > 0" });
  }
  const key = req.headers["idempotency-key"] as string | undefined;
  return idempotent(key, () => ({ id: `rf_${key ?? randomUUID().slice(0, 12)}`, status: "succeeded" }));
});

app.listen({ port, host: "0.0.0.0" }).catch((err: unknown) => {
  app.log.error(err);
  process.exit(1);
});
