import { DateTime } from "luxon";

/**
 * Момент у часовому поясі об'єкта → абсолютний момент часу.
 *
 * date — "YYYY-MM-DD", time — "HH:mm:ss" за місцевим часом,
 * timezone — IANA-пояс об'єкта, напр. "Europe/Kyiv".
 */
export function toPropertyInstant(date: string, time: string, timezone: string): Date {
  const local = DateTime.fromISO(`${date}T${time}`, { zone: timezone });
  if (!local.isValid) {
    throw new RangeError(
      `Некоректний момент: ${date} ${time} ${timezone} (${local.invalidReason ?? "unknown"})`,
    );
  }
  return local.toJSDate();
}

/** Сьогоднішня дата ("YYYY-MM-DD") у поясі об'єкта, зсунута на days днів. */
export function propertyDate(timezone: string, days = 0, now: Date = new Date()): string {
  return DateTime.fromJSDate(now, { zone: timezone }).plus({ days }).toISODate() ?? "";
}
