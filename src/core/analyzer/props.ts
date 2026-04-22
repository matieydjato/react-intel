import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import type { PropDescriptor, PropKind } from "../model.js";
import type { ParsedSource } from "./parser.js";
import type { ComponentInfo } from "./component.js";

const traverse = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;

const EVENT_HANDLER_RE = /^on[A-Z]/;

/**
 * Extract props for the given component by:
 *  1. Locating its props type/interface declaration in the same file.
 *  2. Resolving `interface X extends Y` and `type X = A & B` (same file only).
 *  3. Reading destructured defaults from the component signature.
 *
 * Out of MVP scope: cross-file type resolution, generics, mapped/conditional
 * types. These produce a warning via the returned `warnings` array but never
 * crash the analyzer.
 */
export function extractProps(
  parsed: ParsedSource,
  component: ComponentInfo,
): { props: PropDescriptor[]; warnings: string[] } {
  const warnings: string[] = [];
  const defaults = collectDestructuredDefaults(component.implementation);

  if (!component.propsTypeName) {
    if (component.implementation.params.length > 0) {
      warnings.push(
        `Could not resolve a TypeScript props type for <${component.name}>. ` +
          `Generated tests will be minimal.`,
      );
    }
    return { props: [], warnings };
  }

  const members = collectMembersByName(parsed, component.propsTypeName, warnings, new Set());
  if (members.length === 0) {
    return { props: [], warnings };
  }

  const props: PropDescriptor[] = [];
  const seen = new Set<string>();
  for (const member of members) {
    if (!t.isTSPropertySignature(member) || !t.isIdentifier(member.key)) continue;
    const name = member.key.name;
    if (seen.has(name)) continue; // first occurrence wins (matches TS narrowing semantics for our purposes)
    seen.add(name);
    const annotation = member.typeAnnotation?.typeAnnotation;
    const { kind, rawType, unionMembers } = describeType(annotation);
    const defaultValue = defaults.get(name);
    props.push({
      name,
      kind,
      rawType,
      required: !member.optional && defaultValue === undefined,
      defaultValue,
      unionMembers,
      isEventHandler: EVENT_HANDLER_RE.test(name) || kind === "function",
    });
  }

  return { props, warnings };
}

// ---------------------------------------------------------------------------
// Member collection (handles extends + intersection, same-file only)
// ---------------------------------------------------------------------------

/**
 * Resolve a type name to its property members, recursively merging:
 *  - `interface X extends A, B { ... }` → members from A, B, and X.
 *  - `type X = A & B` → members from A and B.
 *
 * Cycles are guarded by the `visited` set. Unknown references emit a warning
 * and contribute zero members.
 */
function collectMembersByName(
  parsed: ParsedSource,
  name: string,
  warnings: string[],
  visited: Set<string>,
): t.TSTypeElement[] {
  if (visited.has(name)) return [];
  visited.add(name);

  const decl = findTypeDeclaration(parsed, name);
  if (!decl) {
    warnings.push(
      `Props type "${name}" is not declared in this file. ` +
        `Cross-file type resolution is not supported in v1; some props may be missing.`,
    );
    return [];
  }

  if (decl.kind === "interface") {
    const inherited: t.TSTypeElement[] = [];
    for (const ext of decl.extends ?? []) {
      // `extends Foo` — same-file identifier references are resolvable.
      // `extends React.HTMLAttributes<...>` and any qualified/external types
      // are skipped with a clear warning so the user knows what was missed.
      if (!t.isIdentifier(ext.expression)) {
        const printed = printExtendsRef(ext.expression);
        warnings.push(
          `Cannot resolve "extends ${printed}" on "${name}"; ` +
            `qualified or external types are not supported in v1. Some props may be missing.`,
        );
        continue;
      }
      inherited.push(...collectMembersByName(parsed, ext.expression.name, warnings, visited));
    }
    return [...decl.body.body, ...inherited];
  }

  // type alias
  return collectMembersFromType(parsed, decl.value, warnings, visited);
}

function collectMembersFromType(
  parsed: ParsedSource,
  node: t.TSType,
  warnings: string[],
  visited: Set<string>,
): t.TSTypeElement[] {
  if (t.isTSTypeLiteral(node)) return node.members;

  if (t.isTSIntersectionType(node)) {
    const out: t.TSTypeElement[] = [];
    for (const part of node.types) {
      out.push(...collectMembersFromType(parsed, part, warnings, visited));
    }
    return out;
  }

  if (t.isTSTypeReference(node)) {
    const refName = typeReferenceName(node.typeName);
    if (refName) return collectMembersByName(parsed, refName, warnings, visited);
  }

  warnings.push(`Unsupported type shape encountered while resolving props; ignored.`);
  return [];
}

// ---------------------------------------------------------------------------
// Type declaration lookup
// ---------------------------------------------------------------------------

type FoundType =
  | { kind: "interface"; body: t.TSInterfaceBody; extends?: t.TSExpressionWithTypeArguments[] | null }
  | { kind: "alias"; value: t.TSType };

function findTypeDeclaration(parsed: ParsedSource, name: string): FoundType | undefined {
  let result: FoundType | undefined;
  traverse(parsed.ast, {
    TSInterfaceDeclaration(path) {
      if (path.node.id.name === name) {
        result = { kind: "interface", body: path.node.body, extends: path.node.extends };
        path.stop();
      }
    },
    TSTypeAliasDeclaration(path) {
      if (path.node.id.name === name) {
        result = { kind: "alias", value: path.node.typeAnnotation };
        path.stop();
      }
    },
  });
  return result;
}

// ---------------------------------------------------------------------------
// Type description
// ---------------------------------------------------------------------------

interface TypeDescription {
  kind: PropKind;
  rawType?: string;
  unionMembers?: string[];
}

function describeType(node: t.TSType | undefined): TypeDescription {
  if (!node) return { kind: "unknown" };

  if (t.isTSStringKeyword(node)) return { kind: "string", rawType: "string" };
  if (t.isTSNumberKeyword(node)) return { kind: "number", rawType: "number" };
  if (t.isTSBooleanKeyword(node)) return { kind: "boolean", rawType: "boolean" };
  if (t.isTSFunctionType(node)) return { kind: "function", rawType: "function" };

  if (t.isTSUnionType(node)) {
    const literals = node.types.filter(t.isTSLiteralType);
    if (literals.length === node.types.length) {
      const members = literals
        .map((lit) => {
          const literal = lit.literal;
          if (t.isStringLiteral(literal)) return literal.value;
          if (t.isNumericLiteral(literal)) return String(literal.value);
          if (t.isBooleanLiteral(literal)) return String(literal.value);
          return undefined;
        })
        .filter((v): v is string => v !== undefined);
      return { kind: "union", rawType: "union", unionMembers: members };
    }
    // Mixed/non-literal union (e.g. `string | number`, `string | MyType`).
    // Fall back to the first member's kind so we can produce a real sample
    // value instead of `undefined` (which would fail strict typecheck on
    // required props).
    for (const member of node.types) {
      if (t.isTSNullKeyword(member) || t.isTSUndefinedKeyword(member)) continue;
      const inner = describeType(member);
      if (inner.kind !== "unknown") {
        return { ...inner, rawType: "union" };
      }
    }
    return { kind: "union", rawType: "union" };
  }

  if (t.isTSTypeReference(node)) {
    const refName = typeReferenceName(node.typeName);
    if (refName === "ReactNode" || refName === "ReactElement" || refName === "ReactChild") {
      return { kind: "node", rawType: refName };
    }
  }

  if (t.isTSArrayType(node)) return { kind: "array", rawType: "array" };
  if (t.isTSTypeLiteral(node)) return { kind: "object", rawType: "object" };

  return { kind: "unknown" };
}

/** Resolve `Foo` or `React.Foo` → `"Foo"`. */
function typeReferenceName(name: t.TSEntityName): string | undefined {
  if (t.isIdentifier(name)) return name.name;
  if (t.isTSQualifiedName(name)) return name.right.name;
  return undefined;
}

/** Best-effort string for an `extends` reference, used in warning messages only. */
function printExtendsRef(node: t.TSExpressionWithTypeArguments["expression"]): string {
  if (t.isIdentifier(node)) return node.name;
  if (t.isTSQualifiedName(node)) {
    const left = printExtendsRef(node.left);
    return `${left}.${node.right.name}`;
  }
  return "<complex>";
}

// ---------------------------------------------------------------------------
// Default values from destructuring
// ---------------------------------------------------------------------------

function collectDestructuredDefaults(fn: t.Function): Map<string, string> {
  const defaults = new Map<string, string>();
  const param = fn.params[0];
  if (!param || !t.isObjectPattern(param)) return defaults;

  for (const prop of param.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;
    if (t.isAssignmentPattern(prop.value)) {
      defaults.set(prop.key.name, expressionToSource(prop.value.right));
    }
  }
  return defaults;
}

function expressionToSource(node: t.Expression): string {
  if (t.isStringLiteral(node)) return JSON.stringify(node.value);
  if (t.isNumericLiteral(node)) return String(node.value);
  if (t.isBooleanLiteral(node)) return String(node.value);
  if (t.isNullLiteral(node)) return "null";
  if (t.isIdentifier(node)) return node.name;
  return "/* default */";
}
