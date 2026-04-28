---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
---

# Introduction

**react-spec-gen** is a CLI and library that auto-generates Vitest + React
Testing Library tests and Storybook CSF 3 stories from your React components.

Run it on a `.tsx` file — get a test file and a story file written next to the
source. No configuration required.

## What you get

Given a component:

```tsx title="src/Button.tsx"
type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}
```

`npx react-spec-gen src/Button.tsx` produces:

- `Button.test.tsx` — Vitest + RTL test with realistic props, edge cases, and
  ARIA-aware assertions.
- `Button.stories.tsx` — Storybook CSF 3 story with a `Default` plus one
  variant per inferred edge case.

## Design principles

- **Offline & deterministic by default.** No network calls. Same input, same
  output. Reproducible in CI.
- **Static analysis first.** Powered by Babel AST. The optional `--ai` flag
  is a **preview** today (deterministic mock only); when real providers
  land, they will be additive and never overwrite inferred values.
- **Safe by default.** Prompts before overwriting existing files. Always
  prints a verification checklist.
- **Library-friendly.** Ships a programmatic `run()` API for codegen
  pipelines and monorepo scripts.

## When to use it

- You're starting a new React component library or design system.
- You want consistent test/story coverage across a team.
- You want to bootstrap tests for an existing untested codebase.
- You want predictable codegen output that's easy to review.

## When **not** to use it

- You need Jest output (only Vitest is supported today).
- Your components rely on cross-file generic prop type imports (limited
  support — see [Limitations](./limitations)).

## Next steps

- [Get started in 2 minutes](./getting-started)
- [CLI reference](./cli)
- [Programmatic API](./api)
