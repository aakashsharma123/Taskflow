import type { ReactNode } from "react";

export function Lozenge({
  children,
  className = "bg-tint-gray text-tint-gray-text",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`ui-lozenge ${className}`}>
      <span className="truncate">{children}</span>
    </span>
  );
}
