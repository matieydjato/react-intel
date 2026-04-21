# react-intel

> Generate Jest + RTL tests and Storybook CSF 3 stories from your React components.

**Status:** v1.0.0 — MVP complete (all 5 phases of the [PRD](./react-intel-cli-PRD.md)).

## Quickstart

```bash
npm install
npm run build
node dist/bin/react-intel.js tests/fixtures/Button.tsx
```

This will write `Button.test.tsx` and `Button.stories.tsx` next to the source file.

Use `-y` to skip overwrite prompts, `--ai` to enable AI enhancement (not implemented yet).

## Scripts

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
  ai/            (Phase 4) optional AI enhancer
  utils/         Logger, file helpers
bin/
  react-intel.ts CLI shebang entry (built to dist/bin/react-intel.js)
tests/           Vitest suites + .tsx fixtures
```

## Programmatic use

```ts
import { run } from "react-intel";

const { model, outputs } = await run("./Button.tsx");
console.log(outputs.testSource);
```
