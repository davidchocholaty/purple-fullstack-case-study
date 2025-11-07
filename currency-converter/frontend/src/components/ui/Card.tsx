import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "primary" | "white" | "transparent";
  className?: string;
}

export default function Card({ children, variant = "white", className = "" }: CardProps) {
  const variantClasses = {
    primary: "currency-box",
    white: "history-table-container",
    transparent: "result-box",
  };

  const cardClass = `${variantClasses[variant]} ${className}`.trim();

  return <div className={cardClass}>{children}</div>;
}

