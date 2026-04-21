import * as React from "react";

// No props at all — analyzer should not crash, should generate minimal output.
export const Spinner = () => {
  return <div role="status">Loading…</div>;
};
