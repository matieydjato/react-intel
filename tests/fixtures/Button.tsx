import * as React from "react";

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = ({ label, variant = "primary", disabled = false, onClick }: ButtonProps) => {
  return (
    <button type="button" disabled={disabled} onClick={onClick} data-variant={variant}>
      {label}
    </button>
  );
};
