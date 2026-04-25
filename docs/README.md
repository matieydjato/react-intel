# react-spec-gen — Documentation site

Source for the documentation site published at
**https://matieydjato.github.io/react-intel/**.

Built with [Docusaurus](https://docusaurus.io/).

## Local development

From this folder (`docs/`):

```bash
npm install
npm start
```

The dev server opens at `http://localhost:3000/react-intel/` (or `:3001` if
`3000` is already in use). Most changes hot-reload.

## Build

```bash
npm run build
```

Outputs static files in `docs/build/`.

To preview the production build locally:

```bash
npm run serve
```

## Deployment

The site is deployed automatically by the
[`deploy-docs.yml`](../.github/workflows/deploy-docs.yml) workflow on every
push to `main` that touches `docs/**`.

You generally do **not** need to deploy manually — let CI do it.

## File layout

```
docs/
├─ docs/                  # Markdown documentation pages
├─ src/
│  ├─ components/         # Reusable React components (homepage features, …)
│  ├─ css/custom.css      # Global theme overrides
│  └─ pages/index.tsx     # Homepage
├─ static/img/            # Images and logos
├─ docusaurus.config.ts   # Site configuration
└─ sidebars.ts            # Sidebar structure
```

## Editing content

- **Add a doc page**: create a `.md` file in `docs/docs/` and reference its
  `id` in [`sidebars.ts`](./sidebars.ts).
- **Edit the homepage**: [`src/pages/index.tsx`](./src/pages/index.tsx).
- **Edit feature cards**: [`src/components/HomepageFeatures/index.tsx`](./src/components/HomepageFeatures/index.tsx).
- **Edit theme/colors**: [`src/css/custom.css`](./src/css/custom.css).

## Keeping docs in sync with the package

The docs reflect the public API of the `react-spec-gen` package (CLI flags,
exported functions, generated output format). When you change the package,
update the matching pages here:

| Source change | Doc to update |
|---------------|---------------|
| `src/cli/index.ts` | `docs/docs/cli.md` |
| `src/index.ts`, `src/core/pipeline.ts`, `src/ai/index.ts` | `docs/docs/api.md` |
| `src/ai/enhancer.ts`, providers | `docs/docs/ai.md` |
| `src/core/generator/*` | `docs/docs/examples.md`, homepage snippets in `src/pages/index.tsx` |
| `src/core/analyzer/*` | `docs/docs/limitations.md` |
| `package.json` version | Homepage badge in `src/pages/index.tsx`, `docs/docs/limitations.md`, `docs/docs/faq.md` |
