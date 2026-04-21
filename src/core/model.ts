/**
 * Core data contract shared across analyzer, intelligence, generator, and AI layers.
 * All layers communicate exclusively through these types.
 */

export type PropKind =
  | "string"
  | "number"
  | "boolean"
  | "function"
  | "node"
  | "union"
  | "object"
  | "array"
  | "unknown";

export interface PropDescriptor {
  /** Prop name as declared on the component. */
  name: string;
  /** Normalized kind for inference and generation. */
  kind: PropKind;
  /** Raw TypeScript type text, when available. */
  rawType?: string;
  /** True when the prop has no `?` modifier and no default. */
  required: boolean;
  /** Default value text extracted from destructuring or defaultProps, if any. */
  defaultValue?: string;
  /** For union kinds, the literal members (e.g. ["primary","secondary"]). */
  unionMembers?: string[];
  /** True when the prop name matches an event handler pattern (onClick, onChange, ...). */
  isEventHandler: boolean;
}

export interface InferredValue {
  /** Source code expression to use as a value (e.g. `"Submit"`, `true`, `() => {}`). */
  expression: string;
  /** Optional human-readable label for naming test/story variants. */
  label?: string;
}

export interface EdgeCase {
  /** Short identifier, e.g. "disabled", "empty-string", "null-optional". */
  id: string;
  /** Human-readable description used in test names. */
  description: string;
  /** Prop name → expression overrides for this scenario. */
  propOverrides: Record<string, string>;
}

export interface ComponentModel {
  /** Component display name (used for describe blocks, titles, file names). */
  name: string;
  /** Absolute path to the source file. */
  sourceFile: string;
  /** Import specifier to use in generated files (typically `./<name>`). */
  importPath: string;
  /** True when the component is exported as default. */
  isDefaultExport: boolean;
  /** Extracted props. */
  props: PropDescriptor[];
  /** Inferred realistic values, keyed by prop name. */
  inferredValues: Record<string, InferredValue>;
  /** Detected edge case scenarios. */
  edgeCases: EdgeCase[];
  /** Information about the root JSX element returned by the component, if discoverable. */
  rootElement: {
    tag?: string;
    role?: string;
  };
  /** Warnings collected during analysis or AI enhancement. */
  warnings: string[];
}
