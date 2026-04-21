import type { ComponentModel, InferredValue } from "../model.js";
import { HEADER_COMMENT } from "./templates/header.js";

/**
 * Generate a Storybook CSF 3 story file for the component (FR-17–FR-21).
 */
export function generateStory(model: ComponentModel): string {
  const importLine = model.isDefaultExport
    ? `import ${model.name} from "${model.importPath}";`
    : `import { ${model.name} } from "${model.importPath}";`;

  const defaultArgs = renderArgs(model.inferredValues);

  const variantBlocks = model.edgeCases
    .map((edge) => {
      const variantName = toPascalCase(edge.id);
      const overrides = Object.entries(edge.propOverrides)
        .map(([k, v]) => `    ${k}: ${v},`)
        .join("\n");
      return `export const ${variantName}: Story = {
  args: {
    ...Default.args,
${overrides}
  },
};`;
    })
    .join("\n\n");

  return `${HEADER_COMMENT}import type { Meta, StoryObj } from "@storybook/react";
${importLine}

const meta: Meta<typeof ${model.name}> = {
  title: "Components/${model.name}",
  component: ${model.name},
};
export default meta;

type Story = StoryObj<typeof ${model.name}>;

export const Default: Story = {
  args: ${defaultArgs},
};
${variantBlocks ? "\n" + variantBlocks + "\n" : ""}`;
}

function renderArgs(inferred: Record<string, InferredValue>): string {
  const entries = Object.entries(inferred);
  if (entries.length === 0) return "{}";
  const lines = entries
    .map(([k, v]) => `    ${k}: ${storyExpression(v.expression)},`)
    .join("\n");
  return `{\n${lines}\n  }`;
}

/** Stories aren't tests — swap test-only spies for inert no-ops. */
function storyExpression(expr: string): string {
  return expr === "vi.fn()" ? "() => {}" : expr;
}

function toPascalCase(id: string): string {
  return id
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
