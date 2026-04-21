import * as t from "@babel/types";
import type { ComponentInfo } from "./component.js";

/**
 * Native HTML elements → implicit ARIA role used by Testing Library queries.
 * Subset relevant to common UI; extend as needed.
 */
const IMPLICIT_ROLES: Record<string, string> = {
  button: "button",
  a: "link",
  input: "textbox",
  textarea: "textbox",
  select: "combobox",
  img: "img",
  ul: "list",
  ol: "list",
  li: "listitem",
  nav: "navigation",
  main: "main",
  header: "banner",
  footer: "contentinfo",
  article: "article",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  form: "form",
  table: "table",
  dialog: "dialog",
};

export interface RootElementInfo {
  /** Lowercase HTML tag name, e.g. "button". Undefined when the root is not a native element. */
  tag?: string;
  /** Explicit `role="..."` attribute on the root, if any. */
  explicitRole?: string;
  /** Inferred role: explicit wins, otherwise implicit by tag. */
  role?: string;
}

/**
 * Find the first JSX element returned by the component implementation.
 * Walks the function body directly — no Babel traverse, no synthetic files.
 */
export function findRootJsx(component: ComponentInfo): RootElementInfo {
  const body = component.implementation.body;
  const node = findFirstJsx(body);
  if (!node) return {};

  const opening = node.openingElement;
  const tag = jsxNameToString(opening.name);
  const explicitRole = readStringAttr(opening.attributes, "role");
  const lower = tag?.toLowerCase();
  return {
    tag: lower,
    explicitRole,
    role: explicitRole ?? (lower ? IMPLICIT_ROLES[lower] : undefined),
  };
}

function findFirstJsx(node: t.Node | null | undefined): t.JSXElement | undefined {
  if (!node) return undefined;
  if (t.isJSXElement(node)) return node;

  // Recurse into common containers without pulling in @babel/traverse.
  if (t.isBlockStatement(node)) {
    for (const stmt of node.body) {
      const found = findFirstJsx(stmt);
      if (found) return found;
    }
    return undefined;
  }
  if (t.isReturnStatement(node)) return findFirstJsx(node.argument);
  if (t.isParenthesizedExpression(node)) return findFirstJsx(node.expression);
  if (t.isConditionalExpression(node)) {
    return findFirstJsx(node.consequent) ?? findFirstJsx(node.alternate);
  }
  if (t.isLogicalExpression(node)) {
    return findFirstJsx(node.left) ?? findFirstJsx(node.right);
  }
  if (t.isJSXFragment(node)) {
    for (const child of node.children) {
      if (t.isJSXElement(child)) return child;
    }
  }
  return undefined;
}

function jsxNameToString(node: t.JSXOpeningElement["name"]): string | undefined {
  if (t.isJSXIdentifier(node)) return node.name;
  return undefined;
}

function readStringAttr(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[],
  name: string,
): string | undefined {
  for (const attr of attrs) {
    if (!t.isJSXAttribute(attr)) continue;
    if (!t.isJSXIdentifier(attr.name) || attr.name.name !== name) continue;
    const value = attr.value;
    if (t.isStringLiteral(value)) return value.value;
  }
  return undefined;
}
