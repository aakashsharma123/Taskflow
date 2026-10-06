export function TaskListIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m4 6 1.5 1.5L8 5M11 6h9M4 12h3M11 12h9M4 18h3M11 18h9" />
    </svg>
  );
}
