// apps/api/test/stubs/payLinkStub.ts
import type { RefundRequest } from "@api/payments/paylink";

export function payLinkStub({ refundStatus = "pending" } = {}) {
  let lastRefundId: string | undefined;
  return {
    get lastRefundId() { return lastRefundId; },
    refunds: {
      create: async (req: RefundRequest) => {
        lastRefundId = `rf_${req.idempotencyKey}`;
        return { id: lastRefundId, status: refundStatus };
      },
    },
  };
}
