---
id: cli
title: CLI reference
sidebar_position: 3
---

# CLI reference

## Synopsis

```bash
react-spec-gen <file> [options]
```

Run the generator on a single React component file (`.tsx`). The generated
`<Component>.test.tsx` and `<Component>.stories.tsx` are written to the same
directory as the source file.

## Arguments

| Argument | Required | Description |
|----------|:--------:|-------------|
| `<file>` | yes | Path to a `.tsx` file containing a React component. |

If `<file>` is missing, the CLI exits with a clear error.

## Options

| Flag | Alias | Description |
|------|:-----:|-------------|
| `--yes` | `-y` | Skip the overwrite prompt and force-write existing files. |
| `--ai` | | Opt into the enhancer pipeline. **Preview** — currently runs a deterministic mock provider only (no real LLM yet). |
| `--help` | `-h` | Show help. |
| `--version` | `-V` | Show version. |

## Examples

Generate for a single component:

```bash
npx react-spec-gen src/components/Button.tsx
```

Skip overwrite prompts in CI:

```bash
npx react-spec-gen src/components/Button.tsx --yes
```

Enable optional AI enhancement (currently a deterministic mock — see [AI enhancement](./ai)):

```bash
npx react-spec-gen src/components/Button.tsx --ai
```

## Exit codes

| Code | Meaning |
|:----:|---------|
| `0` | Generation succeeded (or user declined to overwrite). |
| `1` | A `ReactIntelError` or unexpected error occurred. The error message and a hint are printed when available. |

## Output behavior

- Writes `<name>.test.tsx` and `<name>.stories.tsx` next to `<file>`.
- If the target file exists and `--yes` is not passed, prompts for
  confirmation. Declined writes are reported as `Skipped …`.
- Prints any AST-extracted warnings (cross-file imports, discriminated
  unions, etc.) before the verification checklist.

## See also

- [AI enhancement](./ai)
- [Limitations](./limitations)
