import type { BookingStatus, CancellationPolicy } from "@shared/booking";

export type PropertyDto = {
  id: string;
  name: string;
  city: string;
  timezone: string;
  checkInTime: string;
  cancellationPolicy: CancellationPolicy;
  nightlyRateMinor: number;
  currency: string;
};

export type BookingDto = {
  id: string;
  propertyId: string;
  guestEmail: string;
  policy: CancellationPolicy;
  checkInDate: string;
  nights: number;
  accommodationMinor: number;
  serviceFeeMinor: number;
  currency: string;
  status: BookingStatus;
  refundAmountMinor: number | null;
  cancelledAt: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body;
}

export const api = {
  listProperties: () => request<PropertyDto[]>("/properties"),
  getProperty: (id: string) => request<PropertyDto>(`/properties/${id}`),
  getBooking: (id: string) => request<BookingDto>(`/bookings/${id}`),
  createBooking: (input: { propertyId: string; checkInDate: string; nights: number; guestEmail: string }) =>
    request<BookingDto>("/bookings", { method: "POST", body: JSON.stringify(input) }),
  cancelBooking: (id: string) => request<BookingDto>(`/bookings/${id}/cancel`, { method: "POST", body: "{}" }),
};
