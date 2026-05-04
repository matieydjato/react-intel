import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the prompts module BEFORE importing the CLI command.
const promptsMock = vi.fn();
vi.mock("prompts", () => ({
  default: (...args: unknown[]) => promptsMock(...args),
}));

const { runGenerate } = await import("../../src/cli/commands/generate.js");

const BUTTON_FIXTURE = resolve(__dirname, "../fixtures/Button.tsx");

let workdir: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  workdir = await mkdtemp(join(tmpdir(), "react-intel-cli-"));
  promptsMock.mockReset();
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  await rm(workdir, { recursive: true, force: true });
});

async function copyFixture(name = "Button.tsx"): Promise<string> {
  const src = await readFile(BUTTON_FIXTURE, "utf8");
  const target = join(workdir, name);
  await writeFile(target, src, "utf8");
  return target;
}

async function exists(path: string): Promise<boolean> {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

describe("runGenerate (CLI command)", () => {
  it("writes test and story files for a valid component (happy path)", async () => {
    const file = await copyFixture();

    const code = await runGenerate(file, { ai: false, yes: true });

    expect(code).toBe(0);
    expect(await exists(join(workdir, "Button.test.tsx"))).toBe(true);
    expect(await exists(join(workdir, "Button.stories.tsx"))).toBe(true);
    expect(promptsMock).not.toHaveBeenCalled();
  });

  it("returns 1 and prints a friendly error when the file does not exist", async () => {
    const code = await runGenerate(join(workdir, "DoesNotExist.tsx"), {
      ai: false,
      yes: true,
    });

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
    const errorOutput = errorSpy.mock.calls.map((c: unknown[]) => c.join(" ")).join("\n");
    expect(errorOutput.toLowerCase()).toMatch(/not found|enoent|cannot|could not|failed/);
  });

  it("overwrites without prompting when --yes is set, even if files exist", async () => {
    const file = await copyFixture();
    // Pre-create the targets so the overwrite path is exercised.
    await writeFile(join(workdir, "Button.test.tsx"), "// stale\n", "utf8");
    await writeFile(join(workdir, "Button.stories.tsx"), "// stale\n", "utf8");

    const code = await runGenerate(file, { ai: false, yes: true });

    expect(code).toBe(0);
    expect(promptsMock).not.toHaveBeenCalled();
    const test = await readFile(join(workdir, "Button.test.tsx"), "utf8");
    const story = await readFile(join(workdir, "Button.stories.tsx"), "utf8");
    expect(test).not.toBe("// stale\n");
    expect(story).not.toBe("// stale\n");
  });

  it("prompts and skips files when the user declines overwrite", async () => {
    const file = await copyFixture();
    await writeFile(join(workdir, "Button.test.tsx"), "// keep me\n", "utf8");
    await writeFile(join(workdir, "Button.stories.tsx"), "// keep me\n", "utf8");
    promptsMock.mockResolvedValue({ ok: false });

    const code = await runGenerate(file, { ai: false, yes: false });

    expect(code).toBe(0);
    expect(promptsMock).toHaveBeenCalledTimes(2);
    const test = await readFile(join(workdir, "Button.test.tsx"), "utf8");
    const story = await readFile(join(workdir, "Button.stories.tsx"), "utf8");
    expect(test).toBe("// keep me\n");
    expect(story).toBe("// keep me\n");
  });

  it("prompts and overwrites when the user confirms", async () => {
    const file = await copyFixture();
    await writeFile(join(workdir, "Button.test.tsx"), "// stale\n", "utf8");
    await writeFile(join(workdir, "Button.stories.tsx"), "// stale\n", "utf8");
    promptsMock.mockResolvedValue({ ok: true });

    const code = await runGenerate(file, { ai: false, yes: false });

    expect(code).toBe(0);
    expect(promptsMock).toHaveBeenCalledTimes(2);
    const test = await readFile(join(workdir, "Button.test.tsx"), "utf8");
    expect(test).not.toBe("// stale\n");
  });

  it("runs the AI enhancer path without throwing when --ai is set", async () => {
    const file = await copyFixture();

    const code = await runGenerate(file, { ai: true, yes: true });

    expect(code).toBe(0);
    expect(await exists(join(workdir, "Button.test.tsx"))).toBe(true);
  });
});
