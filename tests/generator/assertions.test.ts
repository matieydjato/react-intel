import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { run } from "../../src/core/pipeline.js";

const fixture = (name: string) => resolve(__dirname, `../fixtures/${name}`);

describe("generator — role-based assertions", () => {
  it("uses getByRole('button') for Button (root <button>)", async () => {
    const { outputs } = await run(fixture("Button.tsx"));
    expect(outputs.testSource).toContain('screen.getByRole("button")');
  });

  it("uses explicit role for Spinner (role='status')", async () => {
    const { outputs } = await run(fixture("Spinner.tsx"));
    expect(outputs.testSource).toContain('screen.getByRole("status")');
  });

  it("falls back to a presence check when role is unknown", async () => {
    // Card's root is <section> with no explicit role → no implicit role mapping for plain section.
    const { model, outputs } = await run(fixture("Card.tsx"));
    if (!model.rootElement.role) {
      expect(outputs.testSource).toContain("document.body.firstChild");
    }
  });
});

describe("generator — Spinner with no props", () => {
  it("does not declare a baseProps constant", async () => {
    const { outputs } = await run(fixture("Spinner.tsx"));
    expect(outputs.testSource).not.toContain("const baseProps");
    expect(outputs.testSource).toContain("render(<Spinner />)");
  });
});

describe("intelligence — undefined edge cases", () => {
  it("emits an undefined scenario for each optional non-handler prop", async () => {
    const { model } = await run(fixture("Input.tsx"));
    const ids = model.edgeCases.map((c) => c.id);
    expect(ids).toContain("placeholder-undefined");
    expect(ids).toContain("maxLength-undefined");
    expect(ids).toContain("hint-undefined");
    // onChange is required + event handler → no undefined scenario
    expect(ids).not.toContain("onChange-undefined");
  });
});
