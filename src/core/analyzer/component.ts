import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import { basename, extname } from "node:path";
import { AnalysisError } from "../errors.js";
import type { ParsedSource } from "./parser.js";

// @babel/traverse default export interop under ESM.
const traverse = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;

export interface ComponentInfo {
  /** Component identifier name (used as display name). */
  name: string;
  /** True when exported via `export default`. */
  isDefaultExport: boolean;
  /** Name of the props type/interface, if any (e.g. "ButtonProps"). */
  propsTypeName?: string;
  /**
   * The function/arrow node implementing the component, used by `props.ts`
   * to extract destructured defaults.
   */
  implementation: t.Function;
}

/**
 * Locate the primary React component exported from a file.
 *
 * Strategy (MVP):
 *  1. Prefer the default export if it's a function/arrow returning JSX.
 *  2. Otherwise, take the first PascalCase named export that returns JSX.
 */
export function findComponent(parsed: ParsedSource): ComponentInfo {
  // First pass: collect candidate component implementations by binding name,
  // so we can resolve `export default Foo` (identifier reference).
  const declarations = new Map<string, { node: t.Function; typeId?: t.Identifier }>();
  let defaultCandidate: ComponentInfo | undefined;
  let namedCandidate: ComponentInfo | undefined;

  traverse(parsed.ast, {
    FunctionDeclaration(path) {
      if (path.node.id) declarations.set(path.node.id.name, { node: path.node });
    },
    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id) || !path.node.init) return;
      if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
        declarations.set(path.node.id.name, { node: path.node.init, typeId: path.node.id });
      }
    },
  });

  traverse(parsed.ast, {
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      // `export default function Foo() {}` / `export default () => ...`
      const direct = nodeToComponent(decl, inferNameFromFile(parsed.filePath), true);
      if (direct) {
        defaultCandidate = direct;
        return;
      }
      // `export default Foo;` — resolve via collected declarations.
      if (t.isIdentifier(decl)) {
        const found = declarations.get(decl.name);
        if (found) {
          const info = nodeToComponent(found.node, decl.name, true, found.typeId);
          if (info) defaultCandidate = info;
        }
      }
    },
    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (!decl) return;

      if (t.isFunctionDeclaration(decl) && decl.id) {
        const info = nodeToComponent(decl, decl.id.name, false);
        if (info && !namedCandidate) namedCandidate = info;
        return;
      }

      if (t.isVariableDeclaration(decl)) {
        for (const declarator of decl.declarations) {
          if (!t.isIdentifier(declarator.id) || !declarator.init) continue;
          const info = nodeToComponent(declarator.init, declarator.id.name, false, declarator.id);
          if (info && !namedCandidate) namedCandidate = info;
        }
      }
    },
  });

  const chosen = defaultCandidate ?? namedCandidate;
  if (!chosen) {
    throw new AnalysisError(
      `No React component found in file.`,
      "Make sure the file exports a function component (default or named).",
    );
  }
  return chosen;
}

function inferNameFromFile(filePath: string): string {
  return basename(filePath, extname(filePath));
}

/**
 * Convert an export declaration node into a ComponentInfo if it looks like a
 * React component (function or arrow function).
 *
 * `typedId` is the variable identifier when the declaration is a variable, used
 * to pull the props type from `const X: React.FC<Props>` style annotations.
 */
function nodeToComponent(
  node: t.Node,
  fallbackName: string,
  isDefaultExport: boolean,
  typedId?: t.Identifier,
): ComponentInfo | undefined {
  // Direct function declaration: `export default function Button(...) {}`
  if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
    const name = node.id?.name ?? fallbackName;
    return {
      name,
      isDefaultExport,
      propsTypeName: extractPropsTypeFromParam(node.params[0]),
      implementation: node,
    };
  }

  if (t.isArrowFunctionExpression(node)) {
    const idAnnotation = typedId?.typeAnnotation;
    return {
      name: fallbackName,
      isDefaultExport,
      propsTypeName:
        extractPropsTypeFromParam(node.params[0]) ??
        (t.isTSTypeAnnotation(idAnnotation) ? extractPropsTypeFromAnnotation(idAnnotation) : undefined),
      implementation: node,
    };
  }

  // `export default Button` (identifier reference) — unsupported for MVP.
  return undefined;
}

function extractPropsTypeFromParam(param: t.Node | undefined): string | undefined {
  if (!param) return undefined;
  // `(props: Props)` or `({ a, b }: Props)`
  const annotation =
    (t.isIdentifier(param) && param.typeAnnotation) ||
    (t.isObjectPattern(param) && param.typeAnnotation) ||
    undefined;
  if (!annotation || !t.isTSTypeAnnotation(annotation)) return undefined;
  return tsTypeToName(annotation.typeAnnotation);
}

function extractPropsTypeFromAnnotation(
  annotation: t.TSTypeAnnotation | t.Noop | null | undefined,
): string | undefined {
  if (!annotation || !t.isTSTypeAnnotation(annotation)) return undefined;
  const inner = annotation.typeAnnotation;
  // React.FC<Props> | FC<Props>
  if (t.isTSTypeReference(inner) && inner.typeParameters?.params[0]) {
    return tsTypeToName(inner.typeParameters.params[0]);
  }
  return tsTypeToName(inner);
}

function tsTypeToName(node: t.TSType): string | undefined {
  if (t.isTSTypeReference(node) && t.isIdentifier(node.typeName)) {
    return node.typeName.name;
  }
  return undefined;
}
