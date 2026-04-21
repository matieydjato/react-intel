# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

See [BACKLOG.md](BACKLOG.md) for planned work.

## [1.0.0] — 2026-04-21

Initial MVP release.

### Added
- Zero-config CLI: `npx react-intel <Component.tsx>`
- AST-based analysis for `.tsx` / `.jsx` components (`@babel/parser` + `@babel/traverse`)
- Component detection: function declarations, arrow components, `React.FC<Props>`, default and named exports
- Props extraction from inline types, type aliases, and interfaces — including same-file `extends` and `&` intersections
- Realistic prop value inference (strings, numbers, booleans, functions, unions, `ReactNode`)
- Edge case detection (boolean flags, optional props, union variants)
- JSX root element detection with implicit ARIA role mapping for accurate `getByRole` assertions
- Jest + React Testing Library test file generation
- Storybook CSF 3 story file generation
- `--ai` flag with pluggable `AiProvider` architecture (mock provider included)
- AI enhancer with 10s timeout, additive validation, and graceful failure (warnings, never throws)
- `ora` spinner during AI runs
- Post-write verification checklist (inferred values, assertion quality, event handlers)
- `-y / --yes` flag to skip overwrite confirmation
- Programmatic API: `import { run } from 'react-intel'`

### Notes
- Cross-file type resolution is not yet supported; `extends` / `&` referencing external types emit a warning and are skipped.
- Generic components, HOC-wrapped components, and `forwardRef` / `memo` unwrapping are out of scope for v1.0.

[Unreleased]: https://github.com/mdjato/react-intel/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mdjato/react-intel/releases/tag/v1.0.0
