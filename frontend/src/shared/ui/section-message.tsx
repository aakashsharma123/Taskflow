import type { ReactNode } from "react";

const tones = {
  information: { box: "bg-selected", icon: "text-icon-task", path: "M8 7v4" },
  warning: {
    box: "bg-warning-subtle",
    icon: "text-icon-medium",
    path: "M8 4.5v4",
  },
  error: { box: "bg-danger-subtle", icon: "text-icon-high", path: "M8 4.5v4" },
};

export function SectionMessage({
  tone,
  role,
  className = "",
  children,
}: {
  tone: keyof typeof tones;
  role?: "alert" | "status";
  className?: string;
  children: ReactNode;
}) {
  const style = tones[tone];
  return (
    <div
      role={role}
      className={`flex gap-3 rounded-md p-4 ${style.box} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`mt-0.5 size-4 shrink-0 ${style.icon}`}
      >
        <circle cx="8" cy="8" r="7.5" fill="currentColor" />
        <path
          d={style.path}
          stroke="#fff"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle
          cx="8"
          cy={tone === "information" ? 4.75 : 11.25}
          r="1"
          fill="#fff"
        />
      </svg>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
