export function OrbitMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={className}
      fill="none"
    >
      <circle cx="20" cy="20" r="8" fill="currentColor" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="9"
        transform="rotate(-35 20 20)"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
