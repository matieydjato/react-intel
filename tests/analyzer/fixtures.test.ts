import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { run } from "../../src/core/pipeline.js";

const fixture = (name: string) => resolve(__dirname, `../fixtures/${name}`);

describe("analyzer — Input.tsx (type alias, number, ReactNode)", () => {
  it("extracts all props from a type alias", async () => {
    const { model } = await run(fixture("Input.tsx"));
    expect(model.name).toBe("Input");
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["hint", "maxLength", "onChange", "placeholder", "value"]);
  });

  it("classifies prop kinds correctly", async () => {
    const { model } = await run(fixture("Input.tsx"));
    const byName = Object.fromEntries(model.props.map((p) => [p.name, p]));
    expect(byName.value?.kind).toBe("string");
    expect(byName.value?.required).toBe(true);
    expect(byName.maxLength?.kind).toBe("number");
    expect(byName.maxLength?.required).toBe(false);
    expect(byName.onChange?.kind).toBe("function");
    expect(byName.onChange?.isEventHandler).toBe(true);
    expect(byName.hint?.kind).toBe("node");
  });
});

describe("analyzer — Card.tsx (default export, React.FC, children)", () => {
  it("detects default export and component name", async () => {
    const { model } = await run(fixture("Card.tsx"));
    expect(model.name).toBe("Card");
    expect(model.isDefaultExport).toBe(true);
  });

  it("resolves props through React.FC<CardProps>", async () => {
    const { model } = await run(fixture("Card.tsx"));
    const names = model.props.map((p) => p.name).sort();
    expect(names).toEqual(["bordered", "children", "title"]);
  });

  it("uses default export import in generated test", async () => {
    const { outputs } = await run(fixture("Card.tsx"));
    expect(outputs.testSource).toContain('import Card from "./Card";');
    expect(outputs.storySource).toContain('import Card from "./Card";');
  });
});

describe("analyzer — Spinner.tsx (no props)", () => {
  it("does not crash on a propless component", async () => {
    const { model } = await run(fixture("Spinner.tsx"));
    expect(model.name).toBe("Spinner");
    expect(model.props).toEqual([]);
    expect(model.edgeCases).toEqual([]);
  });

  it("generates a minimal but valid test file", async () => {
    const { outputs } = await run(fixture("Spinner.tsx"));
    expect(outputs.testSource).toContain('describe("Spinner"');
    expect(outputs.testSource).toContain("render(<Spinner");
  });
});
