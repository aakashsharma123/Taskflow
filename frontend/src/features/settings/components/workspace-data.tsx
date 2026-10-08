"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { parseWorkspaceBackup } from "@/features/workspace/lib/workspace-backup";

export function WorkspaceData() {
  const workspace = useWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{
    raw: string;
    name: string;
    count: number;
    project: string;
  } | null>(null);
  const [clear, setClear] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  function download() {
    const result = workspace.exportWorkspace();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const url = URL.createObjectURL(
      new Blob([result.data], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `orbit-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setError("");
    setNotice("Workspace backup downloaded.");
  }
  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    setPending(null);
    setClear(false);
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an Orbit JSON backup smaller than 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const raw = await file.text();
      const parsed = parseWorkspaceBackup(raw);
      setPending({
        raw,
        name: file.name,
        count: parsed.tasks.length,
        project: parsed.settings.projectName,
      });
    } catch {
      setError(
        "This file is not a valid Orbit workspace backup. Your current data has not changed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-labelledby="workspace-data"
      className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
    >
      <h2 id="workspace-data" className="text-sm font-semibold">
        Your data, within reach
      </h2>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-base-content/65">
        Download a JSON backup to keep your tasks, epics, sprints, comments and
        settings. Restore it here when you need it.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-outline btn-sm rounded-xl"
          disabled={Boolean(workspace.error) || busy}
          onClick={download}
        >
          Download backup
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm rounded-xl"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? "Reading backup…" : "Restore backup"}
        </button>
        <input
          ref={fileInput}
          type="file"
          aria-label="Choose workspace backup"
          accept=".json,application/json"
          className="sr-only"
          tabIndex={-1}
          onChange={pickFile}
        />
      </div>
      {pending && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6">
          <p className="[overflow-wrap:anywhere]">
            Restore <strong>{pending.project}</strong> from {pending.name}? This
            replaces the current workspace with {pending.count} tasks and the
            backup’s saved settings and history.
          </p>
          <p className="mt-2">
            Download your current backup first if you want to keep it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setPending(null);
                setError("");
              }}
            >
              Cancel restore
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl"
              onClick={() => {
                const result = workspace.importWorkspace(pending.raw);
                setError(result.ok ? "" : result.error);
                if (result.ok) {
                  setPending(null);
                  setNotice("Backup restored. Your workspace is ready.");
                }
              }}
            >
              Confirm restore
            </button>
          </div>
        </div>
      )}
      <div className="mt-6 border-t border-base-300 pt-4">
        {clear ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-6">
            <p>
              Start fresh? This removes all tasks, epics, sprints, comments,
              undo records and history from this browser. Project settings and
              member names stay. Download a backup first to keep your work.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setClear(false)}
              >
                Keep workspace
              </button>
              <button
                type="button"
                className="btn btn-sm border-rose-200 bg-rose-100 text-rose-800"
                onClick={() => {
                  const result = workspace.clearWorkspace();
                  setError(result.ok ? "" : result.error);
                  if (result.ok) {
                    setClear(false);
                    setNotice("Workspace cleared. Ready for your own tasks.");
                  }
                }}
              >
                Confirm start fresh
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={Boolean(workspace.error) || busy}
            className="btn btn-ghost btn-sm text-xs text-rose-800"
            onClick={() => {
              setClear(true);
              setPending(null);
            }}
          >
            Start fresh
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-xs leading-6 text-rose-800">
          {error}
        </p>
      )}
      <p role="status" className="mt-3 text-xs text-teal-800">
        {notice}
      </p>
    </section>
  );
}
