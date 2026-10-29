// apps/api/test/stubs/payLinkStub.ts
import type { RefundRequest } from "@api/payments/paylink";

export const payLinkStub = {
  refunds: {
    create: async (req: RefundRequest) => ({
      id: `rf_${req.idempotencyKey}`,
      status: "succeeded" as const,
    }),
  },
};
