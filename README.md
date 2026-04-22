# react-spec-gen

> Generate Jest + RTL tests and Storybook CSF 3 stories from your React components.

**Status:** v1.0.5 — MVP complete, hardened through dogfooding on real-world codebases.

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

## What's supported

- Function components, arrow components, `React.FC<Props>`
- Default and named exports
- Props from inline types, `type` aliases, `interface` (incl. same-file `extends` / `&`)
- `React.forwardRef` and `React.memo` wrappers (incl. nested combinations)
- Realistic value inference for strings, numbers, booleans, functions, literal & non-literal unions, `ReactNode`
- JSX root-element detection with implicit ARIA role mapping (`getByRole(...)` assertions)
- Edge cases: boolean flags, optional props, union variants

### Known limitations (v1.x)

- Cross-file prop type imports — emits a warning and a minimal test
- Discriminated unions (e.g. `{kind:"a"} | {kind:"b"}`) — emits a warning and a minimal test
- Generic components — render-prop signatures may need manual review
- Files with multiple exported components — picks the default export, falls back to the first

## Roadmap

- v1.0 changes — see [CHANGELOG.md](./CHANGELOG.md)
- Planned work — see [BACKLOG.md](./BACKLOG.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development, project structure, and how to add tests.

## License

[MIT](./LICENSE)

