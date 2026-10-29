// apps/api/test/acceptance/cancellation/refund-status.test.ts
// Очікування — з умови 5 тікету. Написано до реалізації.
import { cancellationService } from "@api/cancellation/service";
import type { Db } from "@api/db";
import { handlePayLinkWebhook } from "@api/webhooks/paylink";
import { startTestDb, type TestDb } from "../../helpers/db";
import { seedBooking } from "../../helpers/seed";
import { payLinkStub } from "../../stubs/payLinkStub";

let testDb: TestDb;
let db: Db;

beforeAll(async () => {
  testDb = await startTestDb();
  db = testDb.db;
});

afterAll(async () => {
  await testDb.stop();
});

it("refunded — лише після refund.succeeded", async () => {
  const payLink = payLinkStub();
  const booking = await seedBooking(db, { policy: "flexible", checkInInDays: 10 });

  await cancellationService(db, payLink).cancelBooking(booking.id);
  expect((await db.bookings.findById(booking.id)).status).not.toBe("refunded");

  await handlePayLinkWebhook(db, { type: "refund.succeeded", refundId: payLink.lastRefundId });
  expect((await db.bookings.findById(booking.id)).status).toBe("refunded");
});
