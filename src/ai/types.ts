import type { ComponentModel, EdgeCase, InferredValue } from "../core/model.js";

/**
 * The contract every AI provider must satisfy.
 *
 * Providers receive a structured snapshot of what the analyzer + intelligence
 * layers already produced (props, inferred values, detected edge cases) and
 * return *additive* enhancements — never a replacement model.
 *
 * Returning `null` for any field means "no suggestions"; the orchestrator
 * keeps the original values.
 */
export interface AiSuggestion {
  /** Replacement realistic values, keyed by prop name. Unknown props are dropped. */
  inferredValues?: Record<string, InferredValue> | null;
  /** Additional edge case scenarios beyond what static analysis found. */
  extraEdgeCases?: EdgeCase[] | null;
  /** Free-form warnings to surface to the user (e.g. "no test for empty array"). */
  warnings?: string[] | null;
}

/**
 * A Provider does the actual call to a model (Claude / Ollama / mock).
 * It is intentionally narrow: take a model snapshot, return suggestions.
 */
export interface AiProvider {
  /** Human-readable provider name, used in CLI output and warnings. */
  readonly name: string;
  suggest(model: ComponentModel): Promise<AiSuggestion>;
}
