import type { CancellationPolicy } from "@shared/booking";

export function policyLabel(policy: CancellationPolicy): string {
  switch (policy) {
    case "flexible":
      return "Гнучка";
    case "strict":
      return "Сувора";
  }
}
