import type { ComponentModel } from "../core/model.js";
import type { Enhancer } from "../core/pipeline.js";
import type { AiProvider } from "./types.js";
import { applySuggestion, validateSuggestion } from "./validate.js";

export interface EnhancerOptions {
  /** Hard timeout in milliseconds. Falls back to the original model on expiry. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Build a pipeline-compatible Enhancer from any AI provider.
 *
 * Behavior (FR-22, FR-25, FR-26 + Risks: latency, hallucination):
 *  - Enforces a hard timeout; on timeout returns the original model with a warning.
 *  - Runs validation on the raw provider response and only applies the safe subset.
 *  - On any provider error, returns the original model with a warning — never throws.
 *  - All AI-derived warnings are surfaced via `model.warnings`.
 */
export function buildEnhancer(provider: AiProvider, opts: EnhancerOptions = {}): Enhancer {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return async (model: ComponentModel): Promise<ComponentModel> => {
    try {
      const raw = await withTimeout(provider.suggest(model), timeoutMs, provider.name);
      const { suggestion, warnings } = validateSuggestion(raw, model);
      const enhanced = applySuggestion(model, suggestion);
      if (warnings.length > 0) {
        return { ...enhanced, warnings: [...enhanced.warnings, ...warnings] };
      }
      return enhanced;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ...model,
        warnings: [
          ...model.warnings,
          `AI enhancement (${provider.name}) failed; falling back to static analysis. ${message}`,
        ],
      };
    }
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, providerName: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${providerName} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
