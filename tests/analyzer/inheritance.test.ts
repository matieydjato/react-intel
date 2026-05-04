import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../../src/core/pipeline.js";

const fixture = (name: string) => resolve(__dirname, `../fixtures/${name}`);

describe("analyzer — interface extends (same-file)", () => {
  it("merges members from a local extended interface", async () => {
    const { model } = await run(fixture("TextField.tsx"));
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["id", "label", "placeholder", "required"]);
  });

  it("preserves required/optional from each level", async () => {
    const { model } = await run(fixture("TextField.tsx"));
    const byName = Object.fromEntries(model.props.map((p) => [p.name, p]));
    expect(byName.id?.required).toBe(true);
    expect(byName.label?.required).toBe(true);
    expect(byName.required?.required).toBe(false); // has default `= false`
    expect(byName.placeholder?.required).toBe(false);
  });
});

describe("analyzer — intersection types (same-file)", () => {
  it("merges members from `A & B`", async () => {
    const { model } = await run(fixture("Badge.tsx"));
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["count", "size", "text"]);
  });

  it("classifies merged union prop correctly", async () => {
    const { model } = await run(fixture("Badge.tsx"));
    const size = model.props.find((p) => p.name === "size");
    expect(size?.kind).toBe("union");
    expect(size?.unionMembers).toEqual(["sm", "md", "lg"]);
  });
});

describe("analyzer — external/unsupported extends", () => {
  it("does not crash and emits a clear warning", async () => {
    const { model } = await run(fixture("Anchor.tsx"));
    // The local-only prop must still be picked up.
    expect(model.props.some((p) => p.name === "label")).toBe(true);
    // And we should warn that React.AnchorHTMLAttributes can't be resolved.
    expect(
      model.warnings.some((w) => /Cross-file type resolution|AnchorHTMLAttributes/.test(w)),
    ).toBe(true);
  });
});
