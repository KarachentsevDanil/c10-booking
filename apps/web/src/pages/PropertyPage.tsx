import { useEffect, useState, type FormEvent } from "react";
import { api, type PropertyDto } from "../api";
import { policyLabel } from "../booking/policyLabel";
import { formatMinor } from "../money";
import { navigate } from "../router";

export function PropertyPage({ id }: { id: string }) {
  const [property, setProperty] = useState<PropertyDto>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getProperty(id).then(setProperty, (e: Error) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(undefined);
    try {
      const booking = await api.createBooking({
        propertyId: id,
        checkInDate: String(form.get("checkInDate")),
        nights: Number(form.get("nights")),
        guestEmail: String(form.get("guestEmail")),
      });
      navigate(`/bookings/${booking.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (!property) return error ? <p role="alert">{error}</p> : <p>Завантаження…</p>;

  return (
    <section>
      <h1>{property.name}</h1>
      <p>
        {property.city} · заїзд о {property.checkInTime.slice(0, 5)} за місцевим часом ·{" "}
        {formatMinor(property.nightlyRateMinor, property.currency)} / ніч
      </p>
      <p>Політика скасування: {policyLabel(property.cancellationPolicy)}</p>

      <form onSubmit={(e) => void onSubmit(e)}>
        <label>
          Дата заїзду
          <input name="checkInDate" type="date" required />
        </label>
        <label>
          Ночей
          <input name="nights" type="number" min={1} max={30} defaultValue={2} required />
        </label>
        <label>
          Email
          <input name="guestEmail" type="email" defaultValue="guest@example.com" required />
        </label>
        <button type="submit" disabled={busy}>
          Забронювати
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
