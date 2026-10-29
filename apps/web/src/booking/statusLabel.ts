import type { BookingStatus } from "@shared/booking";

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "Підтверджено";
    case "cancelled":
      return "Скасовано";
    case "refunded":
      return "Скасовано, кошти повернено";
  }
}
