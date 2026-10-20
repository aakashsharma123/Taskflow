import { pickAccent } from "@/shared/lib/accent";
import { getInitials } from "@/shared/lib/initials";

const sizes = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
};

export function Avatar({
  name,
  size = "sm",
}: {
  name: string | null;
  size?: keyof typeof sizes;
}) {
  if (!name)
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-full bg-tint-gray text-subtle ${sizes[size]}`}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-[60%]">
          <circle cx="8" cy="5.5" r="3" />
          <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5z" />
        </svg>
      </span>
    );
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${pickAccent(name)} ${sizes[size]}`}
    >
      {getInitials(name)}
    </span>
  );
}
