import type { ComponentModel, EdgeCase, InferredValue } from "../model.js";
import { HEADER_COMMENT } from "./templates/header.js";

/**
 * Generate a Jest + React Testing Library test file for the component.
 * Output is deterministic (NFR-07).
 */
export function generateTest(model: ComponentModel): string {
  const importLine = model.isDefaultExport
    ? `import ${model.name} from "${model.importPath}";`
    : `import { ${model.name} } from "${model.importPath}";`;

  const hasProps = Object.keys(model.inferredValues).length > 0;
  const baseProps = hasProps ? renderPropsObject(model.inferredValues) : "{}";
  const baseRender = hasProps
    ? `render(<${model.name} {...baseProps} />);`
    : `render(<${model.name} />);`;
  const rootAssertion = renderRootAssertion(model);

  const edgeCaseBlocks = model.edgeCases
    .map((edge) => renderEdgeCaseTest(model.name, edge, hasProps))
    .join("\n\n");

  return `${HEADER_COMMENT}import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
${importLine}

describe("${model.name}", () => {
${hasProps ? `  const baseProps = ${baseProps} as const;\n\n` : ""}  it("renders with default props", () => {
    ${baseRender}
    ${rootAssertion}
  });
${edgeCaseBlocks ? "\n" + edgeCaseBlocks + "\n" : ""}});
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

function renderEdgeCaseTest(componentName: string, edge: EdgeCase, hasProps: boolean): string {
  const overrides = Object.entries(edge.propOverrides)
    .map(([k, v]) => `      ${k}: ${v},`)
    .join("\n");

  const propsExpr = hasProps
    ? `{
      ...baseProps,
${overrides}
    } as const`
    : `{
${overrides}
    } as const`;

  return `  it("${edge.description}", () => {
    const props = ${propsExpr};
    render(<${componentName} {...props} />);
  });`;
}

function renderPropsObject(inferred: Record<string, InferredValue>): string {
  const entries = Object.entries(inferred);
  if (entries.length === 0) return "{}";
  const lines = entries.map(([k, v]) => `    ${k}: ${v.expression},`).join("\n");
  return `{\n${lines}\n  }`;
}
