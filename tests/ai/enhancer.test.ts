import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { run } from "../../src/core/pipeline.js";
import { buildEnhancer, MockProvider } from "../../src/ai/index.js";
import type { AiProvider } from "../../src/ai/index.js";
import type { ComponentModel } from "../../src/core/model.js";

const fixture = (name: string) => resolve(__dirname, `../fixtures/${name}`);

describe("ai/enhancer — MockProvider", () => {
  it("adds long-text edge cases for required string props", async () => {
    const enhancer = buildEnhancer(new MockProvider());
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    const ids = model.edgeCases.map((c) => c.id);
    expect(ids).toContain("label-long-text");
  });

  it("replaces realistic values for known string props", async () => {
    const enhancer = buildEnhancer(new MockProvider());
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    expect(model.inferredValues.label?.expression).toBe('"Submit"');
    expect(model.inferredValues.label?.label).toBe("ai-realistic");
  });

  it("never removes existing edge cases (additive)", async () => {
    const baseline = await run(fixture("Button.tsx"));
    const enhanced = await run(fixture("Button.tsx"), {
      enhancer: buildEnhancer(new MockProvider()),
    });
    for (const ec of baseline.model.edgeCases) {
      expect(enhanced.model.edgeCases.some((c) => c.id === ec.id)).toBe(true);
    }
  });
});

describe("ai/enhancer — orchestration safety", () => {
  it("falls back to the original model when the provider throws", async () => {
    const failing: AiProvider = {
      name: "failing",
      async suggest() {
        throw new Error("boom");
      },
    };
    const enhancer = buildEnhancer(failing);
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    expect(model.warnings.some((w) => w.includes("failing"))).toBe(true);
    expect(model.warnings.some((w) => w.includes("boom"))).toBe(true);
    // Inferred values should be unchanged from the static analysis.
    expect(model.inferredValues.label?.expression).toBe('"Label"');
  });

  it("times out a slow provider and falls back", async () => {
    const slow: AiProvider = {
      name: "slow",
      suggest() {
        return new Promise(() => {
          /* never resolves */
        });
      },
    };
    const enhancer = buildEnhancer(slow, { timeoutMs: 30 });
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    expect(model.warnings.some((w) => w.includes("timed out"))).toBe(true);
  });

  it("drops AI suggestions referencing unknown props", async () => {
    const liar: AiProvider = {
      name: "liar",
      async suggest() {
        return {
          inferredValues: {
            label: { expression: '"Real"' },
            ghost: { expression: '"Hallucinated"' },
          },
          extraEdgeCases: [
            {
              id: "ghost-case",
              description: "ghost prop",
              propOverrides: { ghost: '"x"' },
            },
          ],
        };
      },
    };
    const enhancer = buildEnhancer(liar);
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    expect(model.inferredValues.label?.expression).toBe('"Real"');
    expect((model.inferredValues as Record<string, unknown>).ghost).toBeUndefined();
    expect(model.edgeCases.some((c) => c.id === "ghost-case")).toBe(false);
    expect(model.warnings.some((w) => w.includes('"ghost"'))).toBe(true);
  });

  it("ignores a non-object response without throwing", async () => {
    const garbage: AiProvider = {
      name: "garbage",
      async suggest(): Promise<any> {
        return "not an object";
      },
    };
    const enhancer = buildEnhancer(garbage);
    const { model } = await run(fixture("Button.tsx"), { enhancer });
    expect(model.warnings.some((w) => w.includes("non-object"))).toBe(true);
  });
});
