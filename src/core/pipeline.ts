import { basename, dirname, extname, resolve } from "node:path";
import { findComponent } from "./analyzer/component.js";
import { findRootJsx } from "./analyzer/jsx.js";
import { parseFile } from "./analyzer/parser.js";
import { extractProps } from "./analyzer/props.js";
import { generateStory } from "./generator/story.js";
import { generateTest } from "./generator/test.js";
import { detectEdgeCases } from "./intelligence/edge-cases.js";
import { inferAll } from "./intelligence/prop-inference.js";
import type { ComponentModel } from "./model.js";

/** Optional async enhancer (e.g. AI). Receives the model, returns an enriched one. */
export type Enhancer = (model: ComponentModel) => Promise<ComponentModel>;

export interface PipelineResult {
  model: ComponentModel;
  outputs: {
    testFilePath: string;
    testSource: string;
    storyFilePath: string;
    storySource: string;
  };
}

export interface PipelineOptions {
  /** Optional enhancer applied after analysis + inference (kept out of `core/` deps). */
  enhancer?: Enhancer;
}

/**
 * End-to-end orchestration: parse → analyze → infer → enhance? → generate.
 * No file I/O — returns the generated source so callers (CLI, tests, future
 * VS Code extension) decide how to write it.
 */
export async function run(filePath: string, opts: PipelineOptions = {}): Promise<PipelineResult> {
  const absolute = resolve(filePath);
  const parsed = await parseFile(absolute);

  const componentInfo = findComponent(parsed);
  const { props, warnings } = extractProps(parsed, componentInfo);
  const rootJsx = findRootJsx(componentInfo);

  const baseName = basename(absolute, extname(absolute));
  let model: ComponentModel = {
    name: componentInfo.name,
    sourceFile: absolute,
    importPath: `./${baseName}`,
    isDefaultExport: componentInfo.isDefaultExport,
    props,
    inferredValues: inferAll(props),
    edgeCases: detectEdgeCases(props),
    rootElement: { tag: rootJsx.tag, role: rootJsx.role },
    warnings,
  };

  if (opts.enhancer) {
    model = await opts.enhancer(model);
  }

  const dir = dirname(absolute);
  return {
    model,
    outputs: {
      testFilePath: resolve(dir, `${baseName}.test.tsx`),
      testSource: generateTest(model),
      storyFilePath: resolve(dir, `${baseName}.stories.tsx`),
      storySource: generateStory(model),
    },
  };
}
