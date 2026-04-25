---
id: configuration
title: Configuration & overwrite behavior
sidebar_position: 6
---

# Configuration & overwrite behavior

react-spec-gen is intentionally **zero-config**. Behavior is controlled
entirely through CLI flags and the file you target.

## Output paths

Generated files are written next to the source:

```
src/components/
├─ Button.tsx
├─ Button.test.tsx     ← generated
└─ Button.stories.tsx  ← generated
```

The output filenames are derived from the source filename. For a file named
`Foo.tsx`, the outputs are `Foo.test.tsx` and `Foo.stories.tsx`.

## Overwrite prompt

If a target file already exists, react-spec-gen asks for confirmation before
overwriting:

```
? Button.test.tsx already exists. Overwrite? (y/N)
```

Pass `--yes` (or `-y`) to skip the prompt — useful in CI:

```bash
react-spec-gen src/Button.tsx --yes
```

Declined writes are reported as `Skipped <path>` in the summary, and the CLI
still exits with code `0`.

## Verification checklist

After writing, react-spec-gen prints a short checklist:

```text
Before committing, verify:
  □ Inferred prop values match real domain data
  □ Generated assertions are meaningful (not just presence checks)
  □ Event handlers (onClick, onChange…) have interaction tests
  □ Warnings above are addressed or acknowledged
```

The last item only appears when warnings were emitted. **Treat the output
like code from a teammate** — review and tweak before committing.

## Warnings

The pipeline may emit warnings during AST extraction (e.g. cross-file prop
type imports, discriminated unions). They are printed before the success
message and surfaced again in the checklist.

See [Limitations](./limitations) for the full list of known cases that
trigger warnings or minimal output.
