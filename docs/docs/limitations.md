---
id: limitations
title: Limitations
sidebar_position: 8
---

# Limitations

react-spec-gen is honest about what it does well and what it doesn't. The
items below either emit a warning, fall back to a minimal test, or require
manual review.

## Known limitations (v0.1.x)

| Case | Behavior |
|------|----------|
| Cross-file prop type imports | Emits a warning and a minimal test. |
| Discriminated unions (e.g. `{kind:"a"} \| {kind:"b"}`) | Emits a warning and a minimal test. |
| Generic components | Render-prop signatures may need manual review. |
| Multiple exported components in one file | Picks the default export, falls back to the first. |
| Jest output | Not supported — only Vitest. Jest is on the roadmap. |

## Edge cases that **are** supported

- Function components, arrow components, `React.FC<Props>`
- Default and named exports
- Inline types, `type` aliases, `interface` (incl. same-file `extends` / `&`)
- `React.forwardRef` and `React.memo` wrappers (incl. nested combinations)
- Realistic value inference for strings, numbers, booleans, functions,
  literal & non-literal unions, `ReactNode`
- JSX root-element detection with implicit ARIA role mapping
  (`getByRole(...)` assertions)
- Boolean flags, optional props, union variants

## Reporting limitations

Found a case that should work but doesn't? Open an issue with a minimal
reproduction:

[github.com/matieydjato/react-intel/issues](https://github.com/matieydjato/react-intel/issues)
