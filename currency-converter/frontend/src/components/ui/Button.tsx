import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "medium" | "small";
  children: ReactNode;
}

export default function Button({ 
  variant = "primary", 
  size = "medium",
  className = "", 
  children, 
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
  };

  const sizeClasses = {
    medium: "btn-medium",
    small: "btn-small",
  };

  const combinedClassName = `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

