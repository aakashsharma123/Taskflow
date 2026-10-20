"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  // Keep the server render and first client render identical. The provider
  // applies the saved palette before paint, independently of this control.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-subtle"
      >
        <circle cx="10" cy="10" r="7" />
        <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" stroke="none" />
      </svg>
      <select
        aria-label="Color theme"
        title="Color theme"
        className="ui-field ui-field-compact w-32 border-line pl-8 text-xs"
        value={mounted ? (theme ?? "system") : "system"}
        disabled={!mounted}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
