/**
 * Public programmatic API. Stable surface for future consumers
 * (VS Code extension, batch tools, custom integrations).
 */
export { run } from "./core/pipeline.js";
export type { PipelineOptions, PipelineResult, Enhancer } from "./core/pipeline.js";
export type {
  ComponentModel,
  PropDescriptor,
  PropKind,
  InferredValue,
  EdgeCase,
} from "./core/model.js";
export {
  ReactIntelError,
  ParseError,
  AnalysisError,
  GenerationError,
  IOError,
} from "./core/errors.js";

// AI layer — kept additive per FR-26.
export { buildEnhancer, MockProvider } from "./ai/index.js";
export type { AiProvider, AiSuggestion, EnhancerOptions } from "./ai/index.js";
