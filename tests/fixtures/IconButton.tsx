import * as React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps {
  variant?: "primary" | "secondary";
  leftIcon?: ReactNode;
  isLoading?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  children?: ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "primary", leftIcon, isLoading, children, onClick }, ref) => {
    return (
      <button ref={ref} className={`btn btn-${variant}`} disabled={isLoading} onClick={onClick}>
        {leftIcon}
        <span>{children}</span>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
