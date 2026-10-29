import Fastify, { type FastifyError } from "fastify";
import { bookingService } from "../bookings/service";
import { cancellationService } from "../cancellation/service";
import type { Db } from "../db";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { PayLinkError, type PayLinkClient } from "../payments/paylink";
import { handlePayLinkWebhook, verifyPayLinkSignature, type PayLinkWebhookEvent } from "../webhooks/paylink";

export type AppDeps = {
  db: Db;
  payLink: PayLinkClient;
  webhookSecret: string;
  logger?: boolean;
  onError?: (err: unknown) => void;
};

export function buildApp({ db, payLink, webhookSecret, logger = true, onError }: AppDeps) {
  const app = Fastify({ logger });
  const bookingsSvc = bookingService(db, payLink);
  const cancellationSvc = cancellationService(db, payLink);

  app.setErrorHandler((err: FastifyError, _req, reply) => {
    if (err instanceof NotFoundError) return reply.code(404).send({ error: err.message });
    if (err instanceof ConflictError) return reply.code(409).send({ error: err.message });
    if (err instanceof ValidationError) return reply.code(400).send({ error: err.message });
    if (err.validation) return reply.code(400).send({ error: err.message });
    if (err instanceof PayLinkError) {
      reply.log.error({ err }, "paylink error");
      return reply.code(502).send({ error: "Платіжний провайдер недоступний" });
    }
    onError?.(err);
    reply.log.error({ err }, "unhandled error");
    return reply.code(500).send({ error: "Внутрішня помилка" });
  });

  app.get("/health", async () => ({ ok: true }));

  app.get("/properties", async () => db.properties.list());

  app.get<{ Params: { id: string } }>("/properties/:id", async (req) => db.properties.findById(req.params.id));

  app.post<{ Body: { propertyId: string; checkInDate: string; nights: number; guestEmail: string } }>(
    "/bookings",
    {
      schema: {
        body: {
          type: "object",
          required: ["propertyId", "checkInDate", "nights", "guestEmail"],
          properties: {
            propertyId: { type: "string" },
            checkInDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
            nights: { type: "integer", minimum: 1, maximum: 30 },
            guestEmail: { type: "string", minLength: 3 },
          },
        },
      },
    },
    async (req, reply) => reply.code(201).send(await bookingsSvc.createBooking(req.body)),
  );

  app.get<{ Params: { id: string } }>("/bookings/:id", async (req) => db.bookings.findById(req.params.id));

  app.post<{ Params: { id: string } }>("/bookings/:id/cancel", async (req) =>
    cancellationSvc.cancelBooking(req.params.id),
  );

  app.register(async (webhooks) => {
    webhooks.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
      done(null, body);
    });

    webhooks.post<{ Body: Buffer }>("/webhooks/paylink", async (req, reply) => {
      const signature = req.headers["x-paylink-signature"];
      if (!verifyPayLinkSignature(req.body, typeof signature === "string" ? signature : undefined, webhookSecret)) {
        return reply.code(401).send({ error: "Невірний підпис" });
      }
      const event = JSON.parse(req.body.toString("utf8")) as PayLinkWebhookEvent;
      await handlePayLinkWebhook(db, event, req.log);
      return reply.code(204).send();
    });
  });

  return app;
}
