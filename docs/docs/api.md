---
id: api
title: Programmatic API
sidebar_position: 4
---

# Programmatic API

react-spec-gen exposes a small, typed API for embedding the generator into
codegen pipelines, monorepo scripts, or custom tooling.

## `run(file, options?)`

Run the full pipeline on a single component file.

```ts
import { run } from "react-spec-gen";

const { model, outputs } = await run("./src/Button.tsx");

console.log(outputs.testFilePath);   // ./src/Button.test.tsx
console.log(outputs.testSource);     // generated test source
console.log(outputs.storyFilePath);  // ./src/Button.stories.tsx
console.log(outputs.storySource);    // generated story source
console.log(model.warnings);         // AST extraction warnings (string[])
```

`run` does **not** write files itself when used programmatically — you control
the output destination.

### Signature

```ts
function run(
  file: string,
  options?: { enhancer?: Enhancer }
): Promise<RunResult>;

type RunResult = {
  model: ComponentModel;
  outputs: {
    testFilePath: string;
    testSource: string;
    storyFilePath: string;
    storySource: string;
  };
};

type Enhancer = (model: ComponentModel) => Promise<ComponentModel>;
```

## `buildEnhancer(provider)` and `MockProvider`

> **Status:** preview. The only provider shipped today is the deterministic
> `MockProvider`. Real LLM providers (Anthropic, Ollama) are on the
> roadmap. See [AI enhancement](./ai) for what's actually wired up.

Use the bundled enhancer with the deterministic mock provider — useful for
testing the enhancer code path without any network access:

```ts
import { run, buildEnhancer, MockProvider } from "react-spec-gen";

const { outputs } = await run("./src/Button.tsx", {
  enhancer: buildEnhancer(new MockProvider()),
});
```

Properties of the bundled enhancer:

- **10s timeout** with a safe fallback to non-AI output (logs a warning,
  never throws).
- **AST-validated suggestions** — references to unknown props are dropped.
- **Purely additive** — never overwrites statically inferred values.

## Custom providers

You can implement your own provider by returning a `Promise<ComponentModel>`
that augments the input model. Keep additions strictly additive.

```ts
import { run, buildEnhancer } from "react-spec-gen";

const customProvider = {
  async enhance(model) {
    return {
      ...model,
      // augment edge cases or inferred values here
    };
  },
};

await run("./src/Button.tsx", {
  enhancer: buildEnhancer(customProvider),
});
```

## Error handling

`run` throws a `ReactIntelError` for known failure modes (unparseable file,
unsupported component shape, etc.). Catch it to surface a clean error
message:

```ts
import { run } from "react-spec-gen";

try {
  const { outputs } = await run("./src/Button.tsx");
} catch (err) {
  if (err && typeof err === "object" && "name" in err && err.name === "ReactIntelError") {
    console.error(err.message);
  } else {
    throw err;
  }
}
```
