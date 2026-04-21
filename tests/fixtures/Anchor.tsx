import * as React from "react";

// Intentionally references an external type the analyzer cannot resolve.
// Expectation: pipeline does NOT crash; emits a warning.
export interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
}

export const Anchor = ({ label, href, ...rest }: AnchorProps) => {
  return (
    <a href={href} {...rest}>
      {label}
    </a>
  );
};
