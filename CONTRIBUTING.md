# Contributing to react-spec-gen

> The project codename and GitHub repo are `react-intel`. The published npm package is `react-spec-gen` (the original name was too similar to `react-intl` for the npm registry to accept).

## Local development

```bash
git clone https://github.com/matieydjato/react-intel.git
cd react-intel
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
| `npm run test:watch` | Watch tests |
| `npm run typecheck` | Type-check without emitting |
| `npm start` | Run the built CLI directly |

Before opening a PR, both `npm run typecheck` and `npm test` must pass. The `prepublishOnly` hook runs them along with the build.

## Project layout

```
src/
  cli/           CLI entry & commands (Commander)
  core/          Pure pipeline: analyzer → intelligence → generator
    analyzer/    Babel parsing & prop extraction
    intelligence/ Value inference & edge case detection
    generator/   Test + story code generation
    pipeline.ts  Orchestrator (also the programmatic API)
    model.ts     Shared data contract
    errors.ts    Typed errors
  ai/            Pluggable AI enhancer (provider interface + mock)
  utils/         Logger, file helpers
bin/
  react-intel.ts CLI shebang entry (built to dist/bin/react-intel.js)
tests/
  fixtures/      Synthetic .tsx components used by all suites
  analyzer/      Tests for prop extraction, HOC unwrapping, inheritance
  generator/     Tests for emitted test & story code
  ai/            Tests for the enhancer + provider interface
  e2e/           Tests for the full pipeline
```

The pipeline is a single deterministic function: `analyzer → intelligence → generator → (optional AI enhancer) → write`. All layers communicate through `core/model.ts`. There is no shared mutable state; randomness is forbidden (NFR-07).

## Adding a regression test

Most bug fixes follow this shape:

1. Create a minimal `.tsx` fixture under `tests/fixtures/` reproducing the input that triggered the bug.
2. Add a test case in the appropriate suite (`tests/analyzer/`, `tests/generator/`, etc.) asserting the **fixed** behavior.
3. Run `npm test` to confirm the new test fails against the unfixed code.
4. Implement the fix in `src/`.
5. Re-run `npm test`. All tests must remain green.

Avoid editing existing fixtures; prefer adding new ones.

## Releasing

1. Bump `version` in `package.json`
2. Add an entry to `CHANGELOG.md` (Keep-a-Changelog format)
3. Update the link references at the bottom of `CHANGELOG.md`
4. `npm run typecheck && npm test && npm run build`
5. `git commit -am "chore(release): vX.Y.Z"` and `git tag -a vX.Y.Z -m "vX.Y.Z"`
6. `git push origin main --tags`
7. `npm publish --access public` (requires npm auth; the `prepublishOnly` hook re-runs typecheck/test/build)
8. Create a GitHub Release for the new tag with the CHANGELOG entry as the body

## Backlog & roadmap

See [BACKLOG.md](./BACKLOG.md) for planned work and known gaps that are explicitly out of scope for v1.x.

## License

By contributing you agree that your contributions will be licensed under the [MIT License](./LICENSE).
