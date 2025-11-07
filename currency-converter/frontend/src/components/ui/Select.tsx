import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export default function Select({ label, id, children, ...props }: SelectProps) {
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="currency-select-box">
        <select id={id} {...props}>
          {children}
        </select>
      </div>
    </div>
  );
}

