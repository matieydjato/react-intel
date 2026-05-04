import type { InferredValue, PropDescriptor } from "../model.js";

/**
 * Produce a deterministic, realistic value for a single prop.
 * Pure function — no randomness, no side effects (NFR-07).
 */
export function inferValue(prop: PropDescriptor): InferredValue {
  if (prop.defaultValue !== undefined) {
    return { expression: prop.defaultValue, label: "default" };
  }

  switch (prop.kind) {
    case "string":
      return { expression: JSON.stringify(humanizeName(prop.name)), label: "text" };
    case "number":
      return { expression: "1", label: "one" };
    case "boolean":
      return { expression: "false", label: "off" };
    case "function":
      return { expression: "vi.fn()", label: "spy" };
    case "node":
      return { expression: JSON.stringify(humanizeName(prop.name)), label: "text" };
    case "union": {
      const first = prop.unionMembers?.[0];
      if (first !== undefined) {
        return { expression: JSON.stringify(first), label: first };
      }
      return { expression: "undefined", label: "unknown-union" };
    }
    case "array":
      return { expression: "[]", label: "empty-array" };
    case "object":
      return { expression: "{}", label: "empty-object" };
    default:
      return { expression: "undefined", label: "unknown" };
  }
}

export function inferAll(props: PropDescriptor[]): Record<string, InferredValue> {
  const out: Record<string, InferredValue> = {};
  for (const prop of props) {
    out[prop.name] = inferValue(prop);
  }
  return out;
}

/**
 * Map a propName like "buttonLabel" → "Button label" for readable defaults.
 */
function humanizeName(name: string): string {
  const spaced = name.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
