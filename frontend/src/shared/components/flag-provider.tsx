"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MAIN_CONTENT_ID } from "./main-content";

type Flag = {
  message: string;
  tone?: "success" | "error";
  action?: { label: string; onClick: () => void };
};

const FlagContext = createContext<((flag: Flag | null) => void) | null>(null);

export function FlagProvider({ children }: { children: ReactNode }) {
  const [flag, setFlag] = useState<Flag | null>(null);
  const regionRef = useRef<HTMLElement>(null);
  const leaveFlag = (run: () => void) => {
    const hadFocus = regionRef.current?.contains(document.activeElement);
    run();
    if (hadFocus) document.getElementById(MAIN_CONTENT_ID)?.focus();
  };
  const action = flag?.action;
  return (
    <FlagContext value={setFlag}>
      {children}
      <section
        ref={regionRef}
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-6 left-4 z-[60] sm:left-6"
      >
        <div role="status">
          {flag && (
            <div className="pointer-events-auto flex w-[min(25rem,calc(100vw-2rem))] items-start gap-3 rounded-md bg-base-100 p-4 shadow-overlay">
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={`mt-0.5 size-5 shrink-0 ${flag.tone === "error" ? "text-icon-high" : "text-icon-done"}`}
              >
                <circle cx="8" cy="8" r="7" fill="currentColor" />
                <path
                  d={
                    flag.tone === "error"
                      ? "M5.5 5.5l5 5M10.5 5.5l-5 5"
                      : "m5 8 2 2 4-4"
                  }
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="[overflow-wrap:anywhere]">{flag.message}</p>
                {action && (
                  <button
                    type="button"
                    className="mt-2 font-medium text-primary hover:underline"
                    onClick={() => leaveFlag(action.onClick)}
                  >
                    {action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss message"
                className="ui-button ui-button-subtle ui-button-icon ui-button-compact w-6"
                onClick={() => leaveFlag(() => setFlag(null))}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-4"
                >
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </FlagContext>
  );
}

export function useFlag() {
  const showFlag = useContext(FlagContext);
  if (!showFlag) throw new Error("useFlag must be used within FlagProvider.");
  return showFlag;
}
