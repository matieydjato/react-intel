import * as React from "react";

interface BaseFieldProps {
  id: string;
  required?: boolean;
}

// Interface extends a local interface — analyzer should merge both.
export interface TextFieldProps extends BaseFieldProps {
  label: string;
  placeholder?: string;
}

export const TextField = ({ id, required = false, label, placeholder }: TextFieldProps) => {
  return (
    <label htmlFor={id}>
      {label}
      <input id={id} required={required} placeholder={placeholder} />
    </label>
  );
};
