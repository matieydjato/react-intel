# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

See [BACKLOG.md](BACKLOG.md) for planned work.

## [0.1.2] — 2026-04-22

### Fixed
- CLI `--version` now reads from `package.json` at build time, so it can no longer drift from the published version (was hardcoded).

## [0.1.1] — 2026-04-22

### Fixed
- CLI program name reported by `--help` is now `react-spec-gen` (was `react-intel`), matching the published npm package and `npx` invocation.

## [0.1.0] — 2026-04-22

Initial public release.

### Added
- Zero-config CLI: `npx react-spec-gen <Component.tsx>`
- AST-based analysis for `.tsx` / `.jsx` components (`@babel/parser` + `@babel/traverse`)
- Component detection: function declarations, arrow components, `React.FC<Props>`, default and named exports
- Props extraction from inline types, type aliases, and interfaces — including same-file `extends` and `&` intersections
- Wrapper unwrapping: `React.forwardRef` / `forwardRef`, `React.memo` / `memo`, and nested combinations (e.g. `memo(forwardRef(...))`)
- Realistic prop value inference for strings, numbers, booleans, functions, literal & non-literal unions, `ReactNode`
- Per-value `as const` on literal-union props so narrow types are preserved without making sibling array/object props readonly
- Edge case detection (boolean flags, optional props, union variants)
- JSX root element detection with implicit ARIA role mapping for accurate `getByRole` assertions
- Vitest + React Testing Library test file generation
- Storybook CSF 3 story file generation
- `--ai` flag with pluggable `AiProvider` architecture (mock provider included)
- AI enhancer with 10 s timeout, additive validation, and graceful failure (warnings, never throws)
- `ora` spinner during AI runs
- Post-write verification checklist (inferred values, assertion quality, event handlers)
- `-y` / `--yes` flag to skip overwrite confirmation
- Programmatic API: `import { run } from "react-spec-gen"`

### Notes
- Cross-file type resolution is not yet supported; `extends` / `&` referencing external types emit a warning and are skipped.
- Generic components and discriminated unions emit a warning and a minimal test.
- Files with multiple exported components pick the default export, falling back to the first.
- Generated tests target Vitest. Jest support is on the roadmap.

[Unreleased]: https://github.com/matieydjato/react-intel/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/matieydjato/react-intel/releases/tag/v0.1.2
[0.1.1]: https://github.com/matieydjato/react-intel/releases/tag/v0.1.1
[0.1.0]: https://github.com/matieydjato/react-intel/releases/tag/v0.1.0
