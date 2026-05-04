import type { ComponentModel, EdgeCase, InferredValue, PropDescriptor } from "../model.js";
import { HEADER_COMMENT } from "./templates/header.js";

/**
 * Generate a Vitest + React Testing Library test file for the component.
 * Output is deterministic (NFR-07).
 */
export function generateTest(model: ComponentModel): string {
  const importLine = model.isDefaultExport
    ? `import ${model.name} from "${model.importPath}";`
    : `import { ${model.name} } from "${model.importPath}";`;

  const literalUnionProps = collectLiteralUnionProps(model.props);
  const hasProps = Object.keys(model.inferredValues).length > 0;
  const baseProps = hasProps ? renderPropsObject(model.inferredValues, literalUnionProps) : "{}";
  const baseRender = hasProps
    ? `render(<${model.name} {...baseProps} />);`
    : `render(<${model.name} />);`;
  const rootAssertion = renderRootAssertion(model);

  const edgeCaseBlocks = model.edgeCases
    .map((edge) => renderEdgeCaseTest(model.name, edge, hasProps, literalUnionProps))
    .join("\n\n");

  return `${HEADER_COMMENT}import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
${importLine}

describe("${model.name}", () => {
${hasProps ? `  const baseProps = ${baseProps};\n\n` : ""}  it("renders with default props", () => {
    ${baseRender}
    ${rootAssertion}
  });
${edgeCaseBlocks ? `\n${edgeCaseBlocks}\n` : ""}});
`;
}

/**
 * Produce an assertion based on the discovered root element role.
 * Falls back to a presence check when no role is discoverable.
 */
function renderRootAssertion(model: ComponentModel): string {
  const role = model.rootElement.role;
  if (role) {
    return `expect(screen.getByRole("${role}")).toBeDefined();`;
  }
  return `expect(document.body.firstChild).not.toBeNull();`;
}

function renderEdgeCaseTest(
  componentName: string,
  edge: EdgeCase,
  hasProps: boolean,
  literalUnionProps: Set<string>,
): string {
  const overrides = Object.entries(edge.propOverrides)
    .map(([k, v]) => `      ${k}: ${narrowIfLiteralUnion(k, v, literalUnionProps)},`)
    .join("\n");

  const propsExpr = hasProps
    ? `{
      ...baseProps,
${overrides}
    }`
    : `{
${overrides}
    }`;

  return `  it("${edge.description}", () => {
    const props = ${propsExpr};
    render(<${componentName} {...props} />);
  });`;
}

function renderPropsObject(
  inferred: Record<string, InferredValue>,
  literalUnionProps: Set<string>,
): string {
  const entries = Object.entries(inferred);
  if (entries.length === 0) return "{}";
  const lines = entries
    .map(([k, v]) => `    ${k}: ${narrowIfLiteralUnion(k, v.expression, literalUnionProps)},`)
    .join("\n");
  return `{\n${lines}\n  }`;
}

/**
 * Append `as const` to a string-literal value when its prop is a literal union
 * (e.g. `"image" | "video"`). This keeps the value's narrow type when the object
 * is spread into the component, without making the entire props object readonly
 * (which would break props typed as mutable arrays/objects).
 */
function narrowIfLiteralUnion(
  propName: string,
  expression: string,
  literalUnionProps: Set<string>,
): string {
  if (!literalUnionProps.has(propName)) return expression;
  // Only narrow primitive literal expressions; never touch undefined/null/calls.
  if (/^(['"`].*['"`]|-?\d+(\.\d+)?|true|false)$/.test(expression.trim())) {
    return `${expression} as const`;
  }
  return expression;
}

function collectLiteralUnionProps(props: PropDescriptor[]): Set<string> {
  const out = new Set<string>();
  for (const p of props) {
    if (p.kind === "union" && p.unionMembers && p.unionMembers.length > 0) {
      out.add(p.name);
    }
  }
  return out;
}
