import type { AiSuggestion } from "./types.js";
import type { ComponentModel, EdgeCase, InferredValue } from "../core/model.js";

/**
 * Validate a raw AiSuggestion against the analyzer-extracted ComponentModel.
 *
 * Rules (FR-22, FR-26, Risks: AI hallucination):
 *  - Drop inferredValues for unknown props.
 *  - Drop edge cases referencing unknown props.
 *  - Coerce non-string warnings.
 *  - Never throw — invalid pieces are removed and reported as warnings.
 */
export function validateSuggestion(
  raw: unknown,
  model: ComponentModel,
): { suggestion: AiSuggestion; warnings: string[] } {
  const warnings: string[] = [];
  if (!isObject(raw)) {
    return { suggestion: {}, warnings: ["AI returned a non-object response; ignoring."] };
  }

  const knownProps = new Set(model.props.map((p) => p.name));

  return {
    suggestion: {
      inferredValues: validateInferredValues(raw.inferredValues, knownProps, warnings),
      extraEdgeCases: validateEdgeCases(raw.extraEdgeCases, knownProps, warnings),
      warnings: validateWarnings(raw.warnings),
    },
    warnings,
  };
}

function validateInferredValues(
  raw: unknown,
  knownProps: Set<string>,
  warnings: string[],
): Record<string, InferredValue> | null {
  if (raw == null) return null;
  if (!isObject(raw)) {
    warnings.push("AI inferredValues was not an object; ignoring.");
    return null;
  }
  const out: Record<string, InferredValue> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!knownProps.has(key)) {
      warnings.push(`AI suggested value for unknown prop "${key}"; dropped.`);
      continue;
    }
    if (!isObject(value) || typeof value.expression !== "string") continue;
    out[key] = {
      expression: value.expression,
      label: typeof value.label === "string" ? value.label : undefined,
    };
  }
  return out;
}

function validateEdgeCases(
  raw: unknown,
  knownProps: Set<string>,
  warnings: string[],
): EdgeCase[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) {
    warnings.push("AI extraEdgeCases was not an array; ignoring.");
    return null;
  }
  const out: EdgeCase[] = [];
  for (const item of raw) {
    if (!isObject(item)) continue;
    if (typeof item.id !== "string" || typeof item.description !== "string") continue;
    if (!isObject(item.propOverrides)) continue;
    const overrides: Record<string, string> = {};
    for (const [propName, expr] of Object.entries(item.propOverrides)) {
      if (!knownProps.has(propName)) continue;
      if (typeof expr !== "string") continue;
      overrides[propName] = expr;
    }
    if (Object.keys(overrides).length === 0) continue;
    out.push({ id: item.id, description: item.description, propOverrides: overrides });
  }
  return out;
}

function validateWarnings(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  return raw.filter((w): w is string => typeof w === "string");
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merge a validated suggestion into the model.
 * AI input is purely additive (FR-26): values are replaced only when present,
 * edge cases are appended, warnings are appended.
 */
export function applySuggestion(model: ComponentModel, suggestion: AiSuggestion): ComponentModel {
  const inferredValues = { ...model.inferredValues };
  if (suggestion.inferredValues) {
    for (const [k, v] of Object.entries(suggestion.inferredValues)) {
      inferredValues[k] = { ...v, label: v.label ?? "ai" };
    }
  }

  const edgeCases = [...model.edgeCases];
  if (suggestion.extraEdgeCases) {
    for (const ec of suggestion.extraEdgeCases) {
      if (edgeCases.some((existing) => existing.id === ec.id)) continue;
      edgeCases.push(ec);
    }
  }

  const warnings = [...model.warnings, ...(suggestion.warnings ?? [])];

  return { ...model, inferredValues, edgeCases, warnings };
}
