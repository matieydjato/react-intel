import type { ComponentModel, EdgeCase, InferredValue } from "../../core/model.js";
import type { AiProvider, AiSuggestion } from "../types.js";

/**
 * Deterministic stand-in provider used when no real AI key is configured
 * and as a fixture for tests. Demonstrates the full enhancer pipeline
 * without making a network call or costing money.
 *
 * Heuristics (intentionally simple):
 *  - String props: replace generic "Foo" placeholders with domain-flavored text.
 *  - Required string props get a `<prop>-long-text` edge case.
 *  - Adds a coverage-gap warning when no event handlers exist.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";

  async suggest(model: ComponentModel): Promise<AiSuggestion> {
    const inferredValues: Record<string, InferredValue> = {};
    const extraEdgeCases: EdgeCase[] = [];

    for (const prop of model.props) {
      if (prop.kind === "string" && prop.required) {
        inferredValues[prop.name] = {
          expression: JSON.stringify(realisticStringFor(prop.name)),
          label: "ai-realistic",
        };
        extraEdgeCases.push({
          id: `${prop.name}-long-text`,
          description: `when ${prop.name} contains a very long string`,
          propOverrides: { [prop.name]: JSON.stringify("A".repeat(200)) },
        });
      }
    }

    const warnings: string[] = [];
    const hasHandler = model.props.some((p) => p.isEventHandler);
    if (!hasHandler && model.props.length > 0) {
      warnings.push("No event handlers detected — consider adding interaction tests once you do.");
    }

    return {
      inferredValues: Object.keys(inferredValues).length ? inferredValues : null,
      extraEdgeCases: extraEdgeCases.length ? extraEdgeCases : null,
      warnings: warnings.length ? warnings : null,
    };
  }
}

/** Pick a domain-flavored string value based on the prop name. */
function realisticStringFor(propName: string): string {
  const lower = propName.toLowerCase();
  if (lower.includes("label") || lower.includes("title")) return "Submit";
  if (lower.includes("placeholder")) return "Enter your email";
  if (lower.includes("email")) return "user@example.com";
  if (lower.includes("name")) return "Jane Doe";
  if (lower.includes("url") || lower.includes("href")) return "https://example.com";
  if (lower.includes("description") || lower.includes("hint")) return "A short description";
  if (lower === "value") return "Hello";
  return "Sample text";
}
