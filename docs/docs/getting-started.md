---
id: getting-started
title: Getting started
sidebar_position: 2
---

# Getting started

Install and run your first generation in under two minutes.

## Requirements

- **Node.js ≥ 20**
- A React project using TypeScript (`.tsx` files)
- Optional: [Vitest](https://vitest.dev/) and [Storybook](https://storybook.js.org/) configured to run the generated files

## Try it without installing

```bash
npx react-spec-gen src/components/Button.tsx
```

Expected output:

```text
✓ Component: Button
✓ Wrote Button.test.tsx
✓ Wrote Button.stories.tsx

Before committing, verify:
  □ Inferred prop values match real domain data
  □ Generated assertions are meaningful (not just presence checks)
  □ Event handlers (onClick, onChange…) have interaction tests
```

## Install as a dev dependency

```bash
npm install -D react-spec-gen
```

Then add a script to your `package.json`:

```json title="package.json"
{
  "scripts": {
    "specs:gen": "react-spec-gen"
  }
}
```

And run it on any component:

```bash
npm run specs:gen src/components/Button.tsx
```

## Add the recommended peer setup

The generated test file imports from `vitest` and `@testing-library/react`.
The generated story file imports from `@storybook/react`. Make sure those
are installed in your project:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @storybook/react
```

> react-spec-gen does **not** add these — it only emits import statements
> compatible with them.

## Review the output

react-spec-gen always prints a verification checklist after writing. Treat
generated files like a PR from a junior teammate: read them, tweak prop
values to match your domain, then commit.

## Next steps

- [CLI reference](./cli)
- [Programmatic API](./api)
- [Configuration & overwrite behavior](./configuration)
- [AI enhancement](./ai)
