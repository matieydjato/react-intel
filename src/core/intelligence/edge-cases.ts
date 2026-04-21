import type { EdgeCase, PropDescriptor } from "../model.js";

/**
 * Detect edge case scenarios from the prop set (FR-14).
 *
 * Examples produced:
 *  - `disabled={true}` when a `disabled` boolean prop exists
 *  - empty string when an optional string prop exists
 *  - each union member as its own scenario
 */
export function detectEdgeCases(props: PropDescriptor[]): EdgeCase[] {
  const cases: EdgeCase[] = [];

  for (const prop of props) {
    if (prop.kind === "boolean" && /^(disabled|loading|readOnly|checked)$/i.test(prop.name)) {
      cases.push({
        id: `${prop.name}-true`,
        description: `when ${prop.name} is true`,
        propOverrides: { [prop.name]: "true" },
      });
    }

    if (prop.kind === "string" && !prop.required) {
      cases.push({
        id: `${prop.name}-empty`,
        description: `when ${prop.name} is an empty string`,
        propOverrides: { [prop.name]: '""' },
      });
    }

    // Optional, non-event-handler props: verify the component handles undefined.
    if (!prop.required && !prop.isEventHandler && prop.defaultValue === undefined) {
      cases.push({
        id: `${prop.name}-undefined`,
        description: `when ${prop.name} is undefined`,
        propOverrides: { [prop.name]: "undefined" },
      });
    }

    if (prop.kind === "union" && prop.unionMembers) {
      // Skip the first member — it's already the "default" inferred value.
      for (const member of prop.unionMembers.slice(1)) {
        cases.push({
          id: `${prop.name}-${member}`,
          description: `when ${prop.name} is ${member}`,
          propOverrides: { [prop.name]: JSON.stringify(member) },
        });
      }
    }
  }

  return cases;
}
