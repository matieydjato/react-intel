---
id: faq
title: FAQ
sidebar_position: 9
---

# FAQ

## Does it make any network calls?

No. By default, react-spec-gen is fully offline. The optional `--ai` flag
uses a bundled `MockProvider` that is also offline. Real network providers
(Anthropic, Ollama) are on the roadmap and will be opt-in.

## Does it support JavaScript files?

The CLI targets `.tsx` files. Plain `.jsx` is not officially supported in
v0.1.x.

## Does it support Jest?

Not yet. Generated tests target Vitest + React Testing Library. Jest is on
the roadmap.

## Will it overwrite my existing tests?

Only if you confirm the prompt or pass `--yes`. Otherwise, existing files
are preserved and reported as `Skipped`.

## Can I customize the generated templates?

Templates are not yet user-configurable from the CLI. If this is important
to your workflow, please open a feature request.

## Does it work in monorepos?

Yes. Run it on individual files or build a small batch script with the
[programmatic API](./api).

## How do I integrate it in CI?

Use `--yes` to skip prompts and check that generated files are committed:

```bash
react-spec-gen src/Button.tsx --yes
git diff --exit-code
```

## Where do bug reports go?

[github.com/matieydjato/react-intel/issues](https://github.com/matieydjato/react-intel/issues)
