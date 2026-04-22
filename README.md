# react-spec-gen

> Generate Jest + RTL tests and Storybook CSF 3 stories from your React components.

**Status:** v1.0.5 — MVP complete (all 5 phases of the [PRD](./PRD.md)), hardened through dogfooding.

> The project codename is `react-intel`. The npm package is published as `react-spec-gen` (the original name was too similar to `react-intl` for the npm registry).

## Quickstart

```bash
npx react-spec-gen src/components/Button.tsx
```

Writes `Button.test.tsx` and `Button.stories.tsx` next to the source file.

### Flags

| Flag | Description |
|---|---|
| `-y`, `--yes` | Skip overwrite prompts |
| `--ai` | Enrich inferred values + edge cases via an `AiProvider` (mock provider bundled) |

The CLI prints a verification checklist after writing — review inferred prop values, assertion meaningfulness, and event-handler coverage before committing.

## Local development

```bash
npm install
npm run build
node dist/bin/react-intel.js tests/fixtures/Button.tsx
```

### Scripts

| Command | Description |
|---|---|
| `npm run build` | Build CLI + library to `dist/` |
| `npm run dev` | Watch-mode build |
| `npm test` | Run Vitest suite |
| `npm run typecheck` | Type-check without emitting |

## Project layout

```
src/
  cli/           CLI entry & commands (Commander)
  core/          Pure pipeline: analyzer → intelligence → generator
    analyzer/    Babel parsing & prop extraction
    intelligence/  Value inference & edge case detection
    generator/   Test + story code generation
    pipeline.ts  Orchestrator (also the programmatic API)
    model.ts     Shared data contract
    errors.ts    Typed errors
  ai/            Pluggable AI enhancer (provider interface + mock)
  utils/         Logger, file helpers
bin/
  react-intel.ts CLI shebang entry (built to dist/bin/react-intel.js)
tests/           Vitest suites + .tsx fixtures
```

## Programmatic use

```ts
import { run, buildEnhancer, MockProvider } from "react-spec-gen";

const { model, outputs } = await run("./Button.tsx", {
  enhancer: buildEnhancer(new MockProvider()),
});

console.log(outputs.testSource);
console.log(outputs.storySource);
```

## AI enhancement

`--ai` is opt-in and pluggable. The bundled `MockProvider` produces realistic strings deterministically (no network calls, no API key). Real providers (Anthropic, Ollama) are planned — see [BACKLOG.md](./BACKLOG.md).

The enhancer:
- Times out at 10s and falls back to non-AI output (warning, never throws)
- Validates suggestions against AST-extracted props (drops references to unknown props)
- Is purely additive — never overwrites statically inferred values

## Status & roadmap

- v1.0 — see [CHANGELOG.md](./CHANGELOG.md)
- v1.1+ — see [BACKLOG.md](./BACKLOG.md)

