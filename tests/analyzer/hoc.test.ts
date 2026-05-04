import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../../src/core/pipeline.js";

const fixture = (name: string) => resolve(__dirname, `../fixtures/${name}`);

describe("analyzer — HOC unwrapping", () => {
  it("detects components wrapped in React.forwardRef and reads the props type from type arguments", async () => {
    const { model } = await run(fixture("IconButton.tsx"));
    expect(model.name).toBe("IconButton");
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["children", "isLoading", "leftIcon", "onClick", "variant"]);
    const variant = model.props.find((p) => p.name === "variant");
    expect(variant?.kind).toBe("union");
    expect(variant?.unionMembers).toEqual(["primary", "secondary"]);
  });

  it("detects components wrapped in memo() that reference a separately-declared function", async () => {
    const { model } = await run(fixture("DataCard.tsx"));
    expect(model.name).toBe("DataCard");
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["children", "isLoading", "title"]);
  });

  it("renders a meaningful test for a forwardRef component", async () => {
    const { outputs } = await run(fixture("IconButton.tsx"));
    expect(outputs.testSource).toContain("import { IconButton }");
    expect(outputs.testSource).toContain('getByRole("button")');
  });
});
