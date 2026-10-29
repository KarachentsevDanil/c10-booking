import type { CancellationPolicy } from "@shared/booking";

export function policyLabel(policy: CancellationPolicy): string {
  switch (policy) {
    case "flexible":
      return "Гнучка";
    case "moderate":
      return "Помірна";
    case "strict":
      return "Сувора";
  }
}
