"use client";

import { m } from "framer-motion";

export function AnimatedProgress({
  value,
  max = 100,
  label,
  className = "",
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const ratio = Math.min(1, Math.max(0, value / Math.max(1, max)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`overflow-hidden rounded-full bg-sunken ${className}`}
    >
      <m.div
        className="h-full w-full origin-left rounded-full bg-current"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: ratio }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
