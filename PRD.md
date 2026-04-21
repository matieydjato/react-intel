# Product Requirements Document (PRD)
## React Component Intelligence CLI

| Field | Details |
|---|---|
| **Product Name** | React Component Intelligence CLI (`react-intel`) |
| **Document Version** | 1.0 |
| **Status** | Draft |
| **Author** | MD |
| **Last Updated** | April 2026 |

---

## Document Scope

This document combines:
- Product requirements
- Technical architecture
- Developer experience considerations

It is intended as a comprehensive specification for both development and evaluation.

## 1. Executive Summary

React Component Intelligence CLI (`react-intel`) is a developer-facing command-line tool that automates the generation of test files and Storybook stories for React components. By combining AST-based static analysis with optional AI enhancement, it eliminates repetitive boilerplate writing, enforces team-wide consistency, and surfaces intelligent insights such as edge cases, missing tests, and realistic prop suggestions.

It is designed to integrate seamlessly into existing development workflows and scale across teams.


## 1.1 Unique Differentiation

What sets `react-intel` apart from existing tools:
- **Hybrid approach:** Combines AST-based static analysis with AI-powered enhancements for deeper insights and smarter code generation.
- **Consistency & Automation:** Enforces team standards and automates repetitive tasks, reducing manual errors.
- **System, not just a generator:** Designed as an extensible pipeline that analyzes, enriches, and generates code, rather than a simple template-based tool.

---

## 1.2 Concrete Example (Before vs After)

**Before:**
```tsx
// Manually written test
import { Button } from './Button';
import { render } from '@testing-library/react';

test('renders Button', () => {
    render(<Button />); // No props, limited coverage
});
```

**After (with react-intel):**
```tsx
import { Button } from './Button';
import { render, screen } from '@testing-library/react';

test('renders Button with label', () => {
    render(<Button label="Submit" disabled={false} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
});

test('handles disabled state', () => {
    render(<Button label="Submit" disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
});
```

This example demonstrates how `react-intel` generates more realistic and comprehensive tests, improving coverage and reliability.

---
## 2. Goals & Objectives

### 2.1 Product Goals

- Reduce the time React developers spend writing boilerplate test and story files.
- Enforce consistent code generation standards across teams and projects.
- Provide contextually aware output that goes beyond simple template substitution.
- Offer an optional AI layer that improves coverage quality and edge case detection.

### 2.2 Success Metrics

| Metric | Target |
|---|---|
| Time saved per component | ≥ 60% reduction vs. manual writing |
| Test coverage improvement | ≥ 80% of props covered in generated tests |
| Adoption | Used in ≥ 3 team projects within 3 months of release |
| CLI execution time | < 5 seconds per component (without AI) |
| Developer satisfaction (NPS) | ≥ 7/10 in initial user survey |

---

## 3. Background & Problem Statement

### 3.1 Context

Modern React development requires writing tests (Jest + React Testing Library) and Storybook stories alongside every component. This work is necessary but repetitive, and its quality varies significantly between developers.

### 3.2 Problems to Solve

**P1 — Repetitive boilerplate:** Developers write near-identical test scaffolding and story structures for every component, consuming hours of productive time.

**P2 — Inconsistent quality:** Manually written or AI-generated code lacks standardization. Tests often render components with no props (`render(<Button />)`) instead of realistic values.

**P3 — Template blindness:** Existing generator tools are purely template-based. They do not analyze the actual component, its props, or its TypeScript types.

**P4 — No edge case awareness:** Important edge cases — disabled states, empty strings, null values — are frequently missed during manual test writing.

**P5 — No team standards enforcement:** There is no automated way to ensure all components follow the same testing and documentation patterns.

---

#### Why This Matters

- **Comparison with existing tools:** Most generators use static templates, missing context and intelligence. `react-intel` leverages AST and AI for smarter, context-aware output.
- **Consistency at scale:** Automated, standardized output ensures all teams follow best practices, reducing review time and onboarding friction.
- **Productivity gains:** Developers spend less time on boilerplate and more on business logic, accelerating delivery.

---

## 4. Target Users

| User | Description | Primary Need |
|---|---|---|
| **Frontend Developer** | Individual contributor building React components | Automate boilerplate, focus on logic |
| **Tech Lead / Senior Engineer** | Sets standards and reviews PRs | Enforce consistent patterns across the team |
| **QA Engineer** | Validates test coverage | Identify missing edge cases quickly |
| **Open Source Contributor** | Works on shared component libraries | Quickly generate stories and tests for new components |

---

## 5. Scope

### 5.1 In Scope (v1.0)

- CLI tool installable via `npx` (zero global install required)
- AST-based analysis of `.tsx` and `.jsx` files
- Extraction of component props, TypeScript types, and default values
- Generation of Jest + React Testing Library test files
- Generation of Storybook story files (CSF 3 format)
- Prop value inference for realistic output
- Edge case detection (empty props, disabled states, required vs optional props)
- Optional AI enhancement mode via flag
- Single-file CLI invocation: `npx react-intel <Component.tsx>`

### 5.2 Out of Scope (v1.0)

- VS Code extension
- Accessibility (a11y) checks
- Performance / re-render detection
- CI/CD pipeline integration
- Multi-component batch processing
- Support for class-based React components
- Non-React frameworks (Vue, Svelte, etc.)

---

## 6. Functional Requirements

### 6.1 CLI Interface

| ID | Requirement |
|---|---|
| FR-01 | The tool must be invocable via `npx react-intel <file>` with no prior global installation. |
| FR-02 | The tool must accept a single `.tsx` or `.jsx` file as input. |
| FR-03 | The tool must support an `--ai` flag to enable AI-powered enhancements. |
| FR-04 | The tool must display a clear success summary listing generated files on completion. |
| FR-05 | The tool must exit with a non-zero code and a descriptive error message on failure. |

### 6.2 Component Analysis (AST)

| ID | Requirement |
|---|---|
| FR-06 | The tool must parse the input file using Babel Parser to produce an AST. |
| FR-07 | The tool must extract all component props including name, type, whether required, and default value. |
| FR-08 | The tool must resolve TypeScript `interface` and `type` definitions associated with the component's props. |
| FR-09 | The tool must identify the component's display name or exported identifier. |
| FR-10 | The tool must detect JSX event handlers (e.g., `onClick`, `onChange`) and include them in the analysis output. |

### 6.3 Test File Generation

| ID | Requirement |
|---|---|
| FR-11 | The tool must generate a `<ComponentName>.test.tsx` file alongside the source file. |
| FR-12 | Generated tests must render the component with realistic, inferred prop values (not empty renders). |
| FR-13 | The tool must generate at least one test case per required prop combination. |
| FR-14 | The tool must generate edge case test cases: empty strings, `null`/`undefined` for optional props, and boolean toggles (e.g., `disabled={true}`). |
| FR-15 | Generated tests must use React Testing Library conventions (`render`, `screen`, `userEvent`). |
| FR-16 | The tool must wrap generated tests in `describe` blocks named after the component. |

### 6.4 Storybook Story Generation

| ID | Requirement |
|---|---|
| FR-17 | The tool must generate a `<ComponentName>.stories.tsx` file alongside the source file. |
| FR-18 | Generated stories must follow Storybook CSF 3 format. |
| FR-19 | The tool must generate a `Default` story and at least one variant story (e.g., `Disabled`, `WithAllProps`). |
| FR-20 | Story `args` must be populated with inferred realistic values, not empty objects. |
| FR-21 | The tool must set the correct `component` and `title` fields in the default export meta. |

### 6.5 AI Enhancement Mode (`--ai`)

| ID | Requirement |
|---|---|
| FR-22 | When `--ai` is passed, the tool must send structured component data (props schema, types, default values, and detected edge cases) to an LLM to enhance generated output. |
| FR-23 | The AI layer must suggest additional edge case scenarios not detectable by static analysis. |
| FR-24 | The AI layer must improve prop value realism (e.g., using domain-relevant strings instead of placeholders). |
| FR-25 | The AI layer must flag potential coverage gaps as warnings in the CLI output. |
| FR-26 | AI enhancement must be additive — the tool must function fully without it. |

#### AI Integration Details

- **Data sent to AI:** Component props schema, types, default values, edge cases, and event handlers.
- **AI returns:** Test scenarios, realistic prop values, additional edge cases, and warnings about potential coverage gaps.
- **Validation:** All AI-generated output is validated against AST data to ensure correctness and consistency.
- **Risk mitigation:**
        - If AI output is invalid or slow, the tool falls back to static analysis results.
        - AI-generated content is clearly labeled in the output.

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | **Performance:** Analysis and generation (without AI) must complete in under 5 seconds for components with up to 30 props. |
| NFR-02 | **Reliability:** The tool must not crash on valid `.tsx`/`.jsx` files; parse failures must surface as clear error messages. |
| NFR-03 | **Zero config:** No configuration file should be required to run the tool in its default mode. |
| NFR-04 | **Extensibility:** The prop-analysis and file-generation layers must be decoupled to allow future output targets (e.g., Cypress, Vitest). |
| NFR-05 | **Type safety:** The CLI codebase must be written in TypeScript with strict mode enabled. |
| NFR-06 | **Cross-platform:** The tool must run on macOS, Linux, and Windows. |

| NFR-07 | **Developer trust:**
        - Generated files include review comments (e.g., `// Generated by react-intel — review before committing`).
        - Tool does not overwrite files without confirmation.
        - Output is deterministic (repeatable) when AI is not used. |

---

## 8. Technical Architecture

### 8.1 High-Level Flow

```
Input: Component.tsx
       │
       ▼
┌─────────────────┐
│  AST Parser     │  ← Babel Parser
│  (Analysis)     │
└────────┬────────┘
         │ Props, types, event handlers
         ▼
┌─────────────────┐        ┌──────────────────┐
│  Intelligence   │ ──AI──▶│  LLM Enhancement │  (optional)
│  Engine         │        └──────────────────┘
└────────┬────────┘
         │ Enriched component model
         ▼
┌─────────────────┐
│  Code Generator │
│  (Test + Story) │
└────────┬────────┘
         │
         ▼
Output: Component.test.tsx
        Component.stories.tsx
```

### 8.2 Tech Stack

| Layer | Technology |
|---|---|
| CLI runtime | Node.js + TypeScript |
| CLI framework | Commander.js |
| AST parsing | Babel Parser (`@babel/parser`) |
| AST traversal | `@babel/traverse` |
| Test generation | React Testing Library + Jest |
| Story generation | Storybook CSF 3 |
| AI integration | Anthropic Claude API (optional) |
| Testing | Vitest |
| Build | tsup |

---

## 9. User Stories

## 9.1 Developer Experience (DX)

CLI tools are judged on usability. `react-intel` prioritizes:
- **Zero-config usage:** Works out of the box with no setup required.
- **Clear CLI feedback:** Success, warnings, and errors are clearly communicated.
- **Safe file handling:** Prompts before overwriting files.
- **Execution speed:** Fast analysis and generation, even for large components.

---

## 9.2 Workflow Integration

`react-intel` fits into real development workflows:
- Manual usage during development for new or updated components
- Integration with pre-commit hooks to enforce standards
- PR automation for consistent test/story generation
- Team-wide adoption for standardization

---

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | Frontend developer | Run `npx react-intel Button.tsx` and get test + story files | I can skip writing boilerplate and focus on logic |
| US-02 | Frontend developer | See edge cases generated automatically | I don't miss disabled states or empty prop scenarios |
| US-03 | Tech lead | Enforce consistent test structure across all components | PRs have a uniform baseline quality |
| US-04 | Developer | Run the tool with `--ai` for smarter scenarios | I get higher-coverage tests with minimal effort |
| US-05 | Developer | Get a helpful error message if parsing fails | I know exactly what to fix in my component file |
| US-06 | Developer | Have the tool run in under 5 seconds | It fits into my normal development flow without friction |

---

## 10. Release Plan

### v1.0 — MVP

- Zero-config CLI (`npx react-intel`)
- AST analysis for `.tsx` / `.jsx`
- Jest + RTL test file generation
- Storybook CSF 3 story generation
- Realistic prop inference
- Edge case detection
- `--ai` flag with LLM enhancement

### v1.1 — Team & DX

- `react-intel.config.js` for team-level customization (output paths, naming conventions)
- Batch mode: `npx react-intel src/components/`
- Watch mode: regenerate on file save
- **Phase 4b — Real AI providers:** drop-in `AiProvider` implementations for Anthropic (cloud) and Ollama (local), selectable via config or `--provider` flag

### v2.0 — Platform Expansion

- VS Code extension
- Accessibility (a11y) suggestions
- Re-render / performance hints
- CI/CD integration (GitHub Actions template)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AST parsing fails on complex generics or decorators | Medium | High | Graceful fallback to partial analysis with clear warnings |
| AI output is inconsistent or hallucinates prop types | Medium | Medium | Validate AI output against AST-extracted types before writing files |
| Generated tests produce false positives | Low | High | Include a `// Generated by react-intel — review before committing` header |
| Developer ignores generated code without reviewing | Medium | Medium | CLI output includes a checklist of items to manually verify |
| LLM API latency makes `--ai` mode feel slow | Low | Medium | Show a progress spinner; enforce a 10s timeout with fallback to non-AI output |
| Overwriting important files accidentally | Low | High | Prompt user before overwriting; safe file handling |
| Incomplete edge case detection | Medium | Medium | Combine static and AI analysis; allow user to add custom cases |
| Security/privacy of code sent to AI | Low | High | Document what data is sent; allow opt-out of AI features |
---

## 12. Future Vision

While v1.0 focuses on CLI automation, the long-term vision includes:
- VS Code extension for in-editor intelligence
- CI/CD integration for automated test/story enforcement
- Performance and accessibility insights
- Broader framework support (Vue, Svelte, etc.)

---

## 13. Open Questions

- Should the tool overwrite existing test/story files, or prompt the user? (Default: prompt)
- Should AI enhancement be opt-in per run (`--ai`) or configurable as a project default?
- Which LLM provider should be supported at launch — Anthropic only, or pluggable?
- Should we support Vitest as an alternative to Jest in v1.0 or defer to v1.1?

---

## 14. Appendix

### Glossary

| Term | Definition |
|---|---|
| AST | Abstract Syntax Tree — a tree representation of source code structure |
| CSF | Component Story Format — Storybook's standard for writing stories |
| RTL | React Testing Library — a testing utility for rendering and querying React components |
| Props | Properties passed to a React component to configure its behavior and appearance |
| Edge case | An input or state at the boundary of normal operating parameters (e.g., empty, null, disabled) |
