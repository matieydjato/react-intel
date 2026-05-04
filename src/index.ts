/**
 * Public programmatic API. Stable surface for future consumers
 * (VS Code extension, batch tools, custom integrations).
 */

export type { AiProvider, AiSuggestion, EnhancerOptions } from "./ai/index.js";
// AI layer — kept additive per FR-26.
export { buildEnhancer, MockProvider } from "./ai/index.js";
export {
  AnalysisError,
  GenerationError,
  IOError,
  ParseError,
  ReactIntelError,
} from "./core/errors.js";
export type {
  ComponentModel,
  EdgeCase,
  InferredValue,
  PropDescriptor,
  PropKind,
} from "./core/model.js";
export type { Enhancer, PipelineOptions, PipelineResult } from "./core/pipeline.js";
export { run } from "./core/pipeline.js";
