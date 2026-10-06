"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { TaskDetailsDialog } from "./task-details-dialog";

const TaskActionsContext = createContext<{
  openTask: (id: number) => void;
} | null>(null);

export function TaskActionsProvider({ children }: { children: ReactNode }) {
  const workspace = useWorkspace();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<{
    id: number;
    action: "archive" | "restore" | "delete";
  } | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const openTask = (id: number) => {
    origin.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedId(id);
    setOpen(true);
  };
  return (
    <TaskActionsContext.Provider value={{ openTask }}>
      {children}
      <TaskDetailsDialog
        task={workspace.tasks.find((task) => task.id === selectedId)}
        open={open}
        onOpenChange={setOpen}
        finalFocusEl={() =>
          origin.current?.isConnected
            ? origin.current
            : document.getElementById("main-content")
        }
        epics={workspace.epics}
        assignees={workspace.settings.members}
        sprints={workspace.sprints}
        onAssignSprint={workspace.assignSprint}
        onAddSubtask={workspace.addSubtask}
        onToggleSubtask={workspace.setSubtaskCompleted}
        onUpdate={(id, input) => {
          const result = workspace.updateTask(id, input);
          if (result.ok) setNotice(`ORB-${id} updated.`);
          return result;
        }}
        onPlacement={(id, placement) => {
          const result = workspace.setPlacement(id, placement);
          if (result.ok)
            setNotice(
              `ORB-${id} moved to ${placement === "board" ? "Board" : "Backlog"}.`,
            );
          return result;
        }}
        onLifecycle={(id, action) => {
          const result =
            action === "delete"
              ? workspace.deleteTask(id)
              : workspace.setArchived(id, action === "archive");
          if (result.ok) {
            setUndo({ id, action });
            setError("");
            setNotice(
              `ORB-${id} ${action === "delete" ? "deleted" : action === "archive" ? "archived" : "restored"}.`,
            );
          }
          return result;
        }}
      />
      {(notice || error) && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xl sm:left-auto sm:right-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p role="status" className="text-xs leading-6">
                {notice}
              </p>
              {error && (
                <p role="alert" className="mt-1 text-xs text-rose-800">
                  {error}
                </p>
              )}
              {undo && (
                <button
                  type="button"
                  className="mt-2 min-h-10 text-xs font-semibold underline underline-offset-4"
                  onClick={() => {
                    const result =
                      undo.action === "delete"
                        ? workspace.restoreDeletedTask(undo.id)
                        : workspace.setArchived(
                            undo.id,
                            undo.action === "restore",
                          );
                    if (result.ok) {
                      setNotice(
                        `ORB-${undo.id} restored to its previous location.`,
                      );
                      setUndo(null);
                      setError("");
                    } else setError(result.error);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="btn btn-ghost btn-sm size-10 p-0"
              onClick={() => {
                setNotice("");
                setError("");
                setUndo(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </TaskActionsContext.Provider>
  );
}
export function useTaskActions() {
  const context = useContext(TaskActionsContext);
  if (!context) throw new Error("Task actions require TaskActionsProvider.");
  return context;
}
