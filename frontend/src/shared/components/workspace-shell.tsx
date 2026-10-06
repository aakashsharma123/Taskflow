import { ProjectIdentity } from "@/features/settings/components/project-identity";
import { ProjectNavigation } from "./project-navigation";
import type { ReactNode } from "react";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-content shadow-md focus:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="workspace-navigation hidden flex-col bg-primary text-primary-content px-4 py-7 lg:flex">
        <div className="px-1">
          <ProjectIdentity />
        </div>
        <p className="mt-10 mb-3 px-3 text-[10px] font-semibold tracking-widest text-primary-content/70 uppercase">
          Planning
        </p>
        <ProjectNavigation />
        <div className="mt-auto border-t border-primary-content/15 px-2 pt-5 text-[11px] leading-6 text-primary-content/70">
          <p className="font-medium text-primary-content/90">
            Your project workspace
          </p>
          <p>One team. A clear way forward.</p>
        </div>
      </aside>
      <div className="min-w-0 bg-workspace">
        <header className="workspace-navigation bg-primary text-primary-content px-5 py-4 lg:hidden">
          <ProjectIdentity />
          <details className="mt-3">
            <summary className="w-fit cursor-pointer rounded-md py-3 text-sm font-medium">
              Project navigation
            </summary>
            <div className="pt-2">
              <ProjectNavigation />
            </div>
          </details>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="px-5 py-7 outline-none sm:px-7 lg:py-9"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
