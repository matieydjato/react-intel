---
id: ai
title: AI enhancement (preview)
sidebar_position: 5
---

# AI enhancement (preview)

The `--ai` flag opts into the enhancer pipeline. **Today it ships only a
deterministic mock provider** — there is no real LLM integration yet. Real
providers are on the roadmap.

The flag exists so the pipeline (timeout, AST validation, safe fallback) is
exercised in CI today, and so swapping in a real provider tomorrow is a
zero-config change for users.

## What ships today

| Feature | Status |
|---------|:------:|
| `--ai` CLI flag | ✅ Available |
| `MockProvider` (deterministic, offline) | ✅ Available |
| `buildEnhancer` programmatic API | ✅ Available |
| Anthropic provider | 🚧 Roadmap |
| Ollama provider | 🚧 Roadmap |
| Custom user-supplied providers | ⚠️ Internal API — not yet stable |

## Defaults

By default, **react-spec-gen makes no network calls**. Even with `--ai`
enabled, the bundled provider is offline and deterministic.

The bundled `MockProvider`:

- Produces realistic strings deterministically (same input → same output).
- Requires no API key.
- Performs no network calls.

## Safety guarantees

The enhancer applies the following guards on every run, and will keep
applying them once real providers land:

| Guard | Behavior |
|-------|----------|
| Timeout | 10 seconds. On timeout, falls back to non-AI output and logs a warning. |
| AST validation | Suggestions referencing unknown props are dropped. |
| Additive only | Never overwrites statically inferred values. |
| Never throws | Provider errors are caught; the pipeline degrades gracefully. |

## Usage

CLI:

```bash
npx react-spec-gen src/Button.tsx --ai
```

Programmatic (with the bundled mock provider):

```ts
import { run, buildEnhancer, MockProvider } from "react-spec-gen";

await run("./src/Button.tsx", {
  enhancer: buildEnhancer(new MockProvider()),
});
```

## When to enable it today

- You want slightly richer string examples in generated stories.
- You want to see the enhancer pipeline in action before real providers ship.

Otherwise, leave it off — the deterministic AST output is the source of
truth.
