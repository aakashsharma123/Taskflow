"use client";
import { useId, useRef, useState } from "react";
import type { Task } from "../types/task";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { commentBodySchema } from "../schemas/task-comment-schema";

export function TaskDiscussion({ task }: { task: Task }) {
  const { settings, addComment, editComment, deleteComment } = useWorkspace();
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function submit() {
    const validated = commentBodySchema.safeParse(body);
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      textarea.current?.focus();
      return;
    }
    const result = addComment(task.id, validated.data);
    setError(result.ok ? "" : result.error);
    if (result.ok) {
      setBody("");
      setNotice("Comment saved.");
      textarea.current?.focus();
    }
  }
  return (
    <section aria-label="Task discussion" className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Keep the context close.</h3>
        <p className="mt-2 text-[11px] leading-6 text-base-content/65">
          Comments save immediately on this device. Local authors are display
          names.
        </p>
      </div>
      <div className="rounded-2xl border border-base-300 bg-workspace/60 p-4">
        <label htmlFor={id} className="text-xs font-medium">
          Comment as {settings.currentMember ?? "Local user"}
        </label>
        <textarea
          id={id}
          ref={textarea}
          rows={3}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError("");
            setNotice("");
          }}
          className="textarea mt-3 w-full rounded-xl bg-base-100 text-sm"
          maxLength={2000}
          placeholder="Add an update, decision or question…"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-base-content/65">
            {body.length}/2,000
          </span>
          <button
            type="button"
            onClick={submit}
            className="btn btn-primary btn-sm rounded-xl"
          >
            Post comment
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs leading-6 text-rose-800">
          {error}
        </p>
      )}
      <p role="status" className="text-xs text-teal-800">
        {notice}
      </p>
      {task.comments.length ? (
        <ol className="space-y-4">
          {[...task.comments].reverse().map((comment) => (
            <li
              key={comment.id}
              className="rounded-2xl border border-base-300/80 bg-base-100 p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/30 text-[10px] font-semibold"
                >
                  {comment.author
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold [overflow-wrap:anywhere]">
                    {comment.author}
                  </p>
                  <p className="mt-1 text-[10px] text-base-content/65">
                    <time dateTime={comment.createdAt}>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(comment.createdAt))}
                    </time>
                    {comment.updatedAt ? " · Edited" : ""}
                  </p>
                </div>
              </div>
              {editing === comment.id ? (
                <div className="mt-4">
                  <label
                    htmlFor={`${id}-${comment.id}`}
                    className="text-xs font-medium"
                  >
                    Edit comment
                  </label>
                  <textarea
                    id={`${id}-${comment.id}`}
                    className="textarea mt-2 w-full rounded-xl"
                    rows={3}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setError("");
                    }}
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm rounded-xl"
                      onClick={() => {
                        const result = editComment(task.id, comment.id, draft);
                        setError(result.ok ? "" : result.error);
                        if (result.ok) {
                          setEditing(null);
                          textarea.current?.focus();
                          setNotice("Comment updated.");
                        }
                      }}
                    >
                      Save comment
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditing(null);
                        textarea.current?.focus();
                        setError("");
                      }}
                    >
                      Cancel edit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-xs leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {comment.body}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {removing === comment.id ? (
                      <>
                        <p className="w-full text-xs">Remove this comment?</p>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setRemoving(null)}
                        >
                          Keep comment
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm border-rose-200 bg-rose-50 text-rose-800"
                          onClick={() => {
                            const result = deleteComment(task.id, comment.id);
                            setError(result.ok ? "" : result.error);
                            if (result.ok) {
                              setRemoving(null);
                              setNotice("Comment removed.");
                              textarea.current?.focus();
                            }
                          }}
                        >
                          Confirm removal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-xs"
                          onClick={() => {
                            setEditing(comment.id);
                            setDraft(comment.body);
                            setError("");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-xs"
                          onClick={() => setRemoving(comment.id)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-5 text-center text-xs text-base-content/65">
          No comments yet. Add the first update.
        </p>
      )}
    </section>
  );
}
