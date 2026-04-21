import * as React from "react";

// Type alias (vs interface) + number prop + ReactNode child + required string + event handler
export type InputProps = {
  value: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (value: string) => void;
  hint?: React.ReactNode;
};

export const Input = ({ value, placeholder, maxLength, onChange, hint }: InputProps) => {
  return (
    <label>
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint}
    </label>
  );
};
