# Backlog

Tracking work beyond the 0.1 initial release. Items grouped by release; ordered roughly by priority within each group.

---

## 0.2 — Team & DX

### Phase 4b — Real AI providers
Architecture is already in place: `AiProvider` interface in [src/ai/types.ts](src/ai/types.ts), enhancer wrapper in [src/ai/enhancer.ts](src/ai/enhancer.ts), additive validation in [src/ai/validate.ts](src/ai/validate.ts). Mock provider in [src/ai/providers/mock.ts](src/ai/providers/mock.ts) is the reference implementation.

- [ ] **Anthropic provider** (`src/ai/providers/anthropic.ts`)
  - Use `@anthropic-ai/sdk`; read key from `ANTHROPIC_API_KEY`
  - Prompt: pass `ComponentModel` (props + types + edge cases), request strict JSON matching `AiSuggestion`
  - Parse + JSON-repair fallback; validation already enforced downstream
  - Default model: `claude-haiku-4-5` (fast/cheap) with `--model` override
- [ ] **Ollama provider** (`src/ai/providers/ollama.ts`)
  - HTTP POST `http://localhost:11434/api/generate` (no SDK dep)
  - Default model: `llama3.2:3b` or `qwen2.5-coder:7b`
  - Handle connection-refused gracefully → warning, skip enhancement
- [ ] **Provider selection**
  - `--provider <mock|anthropic|ollama>` flag (default `mock`)
  - Or read from `react-spec-gen.config.js`
- [ ] **Tests**
  - Mock the SDK / fetch; verify prompt shape, JSON parse failure handling, timeout path
- [ ] **Docs**: README section "AI providers" with setup + privacy notes

### Config file
- [ ] Load `react-spec-gen.config.{js,mjs,ts}` via cosmiconfig (or hand-rolled — keep deps lean)
- [ ] Schema: `outputDir`, `testFileNaming` (`{name}.test.tsx` vs `{name}.spec.tsx`), `storyFileNaming`, `provider`, `model`, `timeoutMs`
- [ ] CLI flags override config
- [ ] Warn (not error) on unknown keys

### Batch mode
- [ ] `npx react-spec-gen src/components/` walks dir for `*.tsx` (skip `.test.`, `.stories.`, `.d.ts`)
- [ ] Sequential by default; `--concurrency N` for parallel
- [ ] Per-file success/skip/fail summary at end
- [ ] Single-file path still works (current behavior)

### Watch mode
- [ ] `--watch` flag uses `chokidar` on the resolved target (file or dir)
- [ ] Debounce 250 ms; regenerate only the changed file
- [ ] Persistent spinner / status line; Ctrl+C exits cleanly

---

## 1.0 — Platform Expansion

- [ ] VS Code extension (right-click → "Generate tests with react-spec-gen")
- [ ] Accessibility (a11y) suggestions in checklist (axe-core static rules on the JSX root)
- [ ] Re-render / performance hints (detect inline objects/arrays in default props)
- [ ] CI/CD integration: GitHub Action template that runs `react-spec-gen --check` (fails if generated files are stale)
- [ ] Jest output target (alongside Vitest) — `--framework jest`
- [ ] Cypress component-test output target

---

## Tech debt / nice-to-haves

- [ ] Cross-file type resolution (currently `extends Foo` only resolves same-file types — see [src/core/analyzer/props.ts](src/core/analyzer/props.ts))
- [ ] Generic component support (e.g. `function List<T>(props: Props<T>)`)
- [ ] Discriminated union props → generate one test per variant
- [ ] `--dry-run` flag (print what would be written, write nothing)
- [ ] Telemetry opt-in for anonymized usage stats (only if there's demand)

---

## Release prep (initial 0.1.0)

- [x] Verify name availability on npm — *renamed to `react-spec-gen` due to similarity with `react-intl`*
- [x] Add `LICENSE` (MIT)
- [x] Add `CHANGELOG.md`
- [x] Tag `v0.1.0` and push
- [x] `npm publish --access public`
