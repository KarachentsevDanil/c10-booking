import { cancellationService } from "@api/cancellation/service";
import type { Db } from "@api/db";
import { ConflictError } from "@api/errors";
import { startTestDb, type TestDb } from "../helpers/db";
import { seedBooking } from "../helpers/seed";
import { payLinkStub } from "../stubs/payLinkStub";

let testDb: TestDb;
let db: Db;

beforeAll(async () => {
  testDb = await startTestDb();
  db = testDb.db;
});

afterAll(async () => {
  await testDb.stop();
});

it("скасування повертає кошти й оновлює статус", async () => {
  const booking = await seedBooking(db, { policy: "flexible", checkInInDays: 10 });
  await cancellationService(db, payLinkStub).cancelBooking(booking.id);
  const updated = await db.bookings.findById(booking.id);
  expect(updated.status).toBe("refunded");
});

it("повернення на суму в мінорних одиницях, ідемпотентний ключ від бронювання", async () => {
  const booking = await seedBooking(db, { policy: "strict", checkInInDays: 10 });
  const create = jest.spyOn(payLinkStub.refunds, "create");

  await cancellationService(db, payLinkStub).cancelBooking(booking.id);

  expect(create).toHaveBeenCalledWith({
    paymentId: booking.paymentId,
    amountMinor: booking.accommodationMinor / 2,
    idempotencyKey: `cancel-${booking.id}`,
  });
  const updated = await db.bookings.findById(booking.id);
  expect(updated.refundAmountMinor).toBe(booking.accommodationMinor / 2);
  expect(updated.refundId).toBe(`rf_cancel-${booking.id}`);
  create.mockRestore();
});

it("без повернення: статус cancelled, PayLink не викликається", async () => {
  const booking = await seedBooking(db, { policy: "strict", checkInInDays: 3 });
  const create = jest.spyOn(payLinkStub.refunds, "create");

  await cancellationService(db, payLinkStub).cancelBooking(booking.id);

  expect(create).not.toHaveBeenCalled();
  const updated = await db.bookings.findById(booking.id);
  expect(updated.status).toBe("cancelled");
  expect(updated.refundAmountMinor).toBe(0);
  create.mockRestore();
});

it("повторне скасування відхиляється", async () => {
  const booking = await seedBooking(db, { policy: "flexible", checkInInDays: 10 });
  const service = cancellationService(db, payLinkStub);
  await service.cancelBooking(booking.id);

  await expect(service.cancelBooking(booking.id)).rejects.toBeInstanceOf(ConflictError);
});
