import { useEffect, useState } from "react";
import { api, type PropertyDto } from "../api";
import { policyLabel } from "../booking/policyLabel";
import { formatMinor } from "../money";
import { navigate } from "../router";

export function PropertiesPage() {
  const [items, setItems] = useState<PropertyDto[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    api.listProperties().then(setItems, (e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <section>
      <h1>Житло</h1>
      <ul className="cards">
        {items.map((p) => (
          <li key={p.id}>
            <a
              href={`/properties/${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/properties/${p.id}`);
              }}
            >
              {p.name}
            </a>
            <span>{p.city}</span>
            <span>{formatMinor(p.nightlyRateMinor, p.currency)} / ніч</span>
            <span>Скасування: {policyLabel(p.cancellationPolicy)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
