import { useEffect, useState } from "react";
import { api, type BookingDto, type PropertyDto } from "../api";
import { policyLabel } from "../booking/policyLabel";
import { statusLabel } from "../booking/statusLabel";
import { formatMinor } from "../money";

export function BookingPage({ id }: { id: string }) {
  const [booking, setBooking] = useState<BookingDto>();
  const [property, setProperty] = useState<PropertyDto>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getBooking(id)
      .then(async (b) => {
        setBooking(b);
        setProperty(await api.getProperty(b.propertyId));
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function onCancel() {
    setBusy(true);
    setError(undefined);
    try {
      setBooking(await api.cancelBooking(id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!booking || !property) return error ? <p role="alert">{error}</p> : <p>Завантаження…</p>;

  return (
    <section>
      <h1>Бронювання {booking.id}</h1>
      <dl>
        <dt>Об'єкт</dt>
        <dd>{property.name}</dd>
        <dt>Заїзд</dt>
        <dd>
          {booking.checkInDate} о {property.checkInTime.slice(0, 5)} ({property.timezone})
        </dd>
        <dt>Політика скасування</dt>
        <dd>{policyLabel(booking.policy)}</dd>
        <dt>Проживання</dt>
        <dd>{formatMinor(booking.accommodationMinor, booking.currency)}</dd>
        <dt>Сервісний збір</dt>
        <dd>{formatMinor(booking.serviceFeeMinor, booking.currency)}</dd>
        <dt>Статус</dt>
        <dd data-testid="booking-status">{statusLabel(booking.status)}</dd>
        {booking.refundAmountMinor !== null && (
          <>
            <dt>Повернення</dt>
            <dd data-testid="refund-amount">{formatMinor(booking.refundAmountMinor, booking.currency)}</dd>
          </>
        )}
      </dl>
      {booking.status === "confirmed" && (
        <button type="button" disabled={busy} onClick={() => void onCancel()}>
          Скасувати бронювання
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
