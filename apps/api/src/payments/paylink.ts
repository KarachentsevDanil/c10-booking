// Клієнт платіжного провайдера PayLink.

export type PaymentRequest = {
  amountMinor: number;
  currency: string;
  description: string;
  idempotencyKey: string;
};

export type Payment = { id: string; status: "succeeded" };

export type RefundRequest = {
  paymentId: string;
  amountMinor: number;
  idempotencyKey: string;
};

export type Refund = { id: string; status: "succeeded" };

export class PayLinkError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "PayLinkError";
  }
}

export interface PayLinkClient {
  payments: {
    /** Списує оплату. Повертає підтверджений платіж або кидає PayLinkError. */
    create(req: PaymentRequest): Promise<Payment>;
  };
  refunds: {
    /** Частковий refund на той самий платіж. Повертає підтверджене повернення або кидає PayLinkError. */
    create(req: RefundRequest): Promise<Refund>;
  };
}

export function createPayLinkClient({
  baseUrl,
  apiKey,
  fetchImpl = fetch,
}: {
  baseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}): PayLinkClient {
  async function post<T>(path: string, body: unknown, idempotencyKey: string): Promise<T> {
    const res = await fetchImpl(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
      throw new PayLinkError(err.message ?? `PayLink ${path}: HTTP ${res.status}`, res.status, err.code);
    }
    return (await res.json()) as T;
  }

  return {
    payments: {
      create: ({ idempotencyKey, ...body }) => post<Payment>("/v1/payments", body, idempotencyKey),
    },
    refunds: {
      create: ({ idempotencyKey, ...body }) => post<Refund>("/v1/refunds", body, idempotencyKey),
    },
  };
}
