import * as React from "react";

type Sizing = {
  size?: "sm" | "md" | "lg";
};

type BadgeOwn = {
  text: string;
  count?: number;
};

// Intersection of two local type aliases — analyzer should merge members.
export type BadgeProps = BadgeOwn & Sizing;

export const Badge = ({ text, count, size = "md" }: BadgeProps) => {
  return (
    <span data-size={size}>
      {text}
      {count !== undefined ? ` (${count})` : null}
    </span>
  );
};
