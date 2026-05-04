import ora from "ora";
import { buildEnhancer, MockProvider } from "../../ai/index.js";
import { ReactIntelError } from "../../core/errors.js";
import type { ComponentModel } from "../../core/model.js";
import type { Enhancer } from "../../core/pipeline.js";
import { run } from "../../core/pipeline.js";
import { fileExists, writeFileSafe } from "../../utils/file.js";
import { logger } from "../../utils/logger.js";
import { confirmOverwrite } from "../prompts.js";

export interface GenerateOptions {
  ai: boolean;
  yes: boolean;
}

export async function runGenerate(file: string, opts: GenerateOptions): Promise<number> {
  try {
    logger.debug(`runGenerate: file=${file}, ai=${opts.ai}, yes=${opts.yes}`);
    const enhancer = opts.ai ? withSpinner(buildEnhancer(new MockProvider())) : undefined;

    const result = await run(file, { enhancer });
    const { testFilePath, testSource, storyFilePath, storySource } = result.outputs;
    logger.debug(
      `pipeline result: component=${result.model.name}, props=${result.model.props.length}, warnings=${result.model.warnings.length}`,
    );

    for (const w of result.model.warnings) logger.warn(w);

    const writes = await Promise.all([
      maybeWrite(testFilePath, testSource, opts.yes),
      maybeWrite(storyFilePath, storySource, opts.yes),
    ]);

    logger.info("");
    logger.success(`Component: ${result.model.name}`);
    for (const w of writes) {
      if (w.written) logger.success(`Wrote ${w.path}`);
      else logger.dim(`Skipped ${w.path}`);
    }

    printChecklist(result.model);
    return 0;
  } catch (err) {
    if (err instanceof ReactIntelError) {
      logger.error(err.message);
      if (err.hint) logger.dim(`Hint: ${err.hint}`);
    } else {
      logger.error(err instanceof Error ? err.message : String(err));
    }
    return 1;
  }
}

/** Wrap an Enhancer so the user sees progress feedback during the LLM call. */
function withSpinner(enhancer: Enhancer): Enhancer {
  return async (model) => {
    const spinner = ora({ text: "Enhancing with AI…", spinner: "dots" }).start();
    try {
      const enhanced = await enhancer(model);
      const failed = enhanced.warnings.length > model.warnings.length;
      if (failed) spinner.warn("AI enhancement completed with warnings.");
      else spinner.succeed("AI enhancement applied.");
      return enhanced;
    } catch (err) {
      spinner.fail("AI enhancement failed.");
      throw err;
    }
  };
}

/**
 * Print a short verification checklist so users review the generated output
 * (Risks table mitigation: "Developer ignores generated code without reviewing").
 */
function printChecklist(model: ComponentModel): void {
  logger.info("");
  logger.info("Before committing, verify:");
  logger.dim("  □ Inferred prop values match real domain data");
  logger.dim("  □ Generated assertions are meaningful (not just presence checks)");
  if (model.props.some((p) => p.isEventHandler)) {
    logger.dim("  □ Event handlers (onClick, onChange…) have interaction tests");
  }
  if (model.warnings.length > 0) {
    logger.dim("  □ Warnings above are addressed or acknowledged");
  }
}

async function maybeWrite(
  path: string,
  content: string,
  force: boolean,
): Promise<{ path: string; written: boolean }> {
  if (!force && (await fileExists(path))) {
    const ok = await confirmOverwrite(path);
    if (!ok) return { path, written: false };
  }
  await writeFileSafe(path, content);
  return { path, written: true };
}
