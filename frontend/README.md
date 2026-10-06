# Orbit frontend

Frontend-only project workspace using Next.js App Router, strict TypeScript,
Ark UI dialogs, Tailwind CSS, DaisyUI, Zod and dnd-kit. Poppins is self-hosted.
The `@/*` alias resolves to `src/*`.

## Run locally

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The home route redirects to `/tasks`.
No backend or environment variables are required.

## Features

- **Board (`/tasks`)**: create/edit tasks, epics and one-level subtasks. Move cards
  between columns using their handles. Space starts a keyboard drag, arrows move
  it, Space drops it and Escape cancels. The task status field is an alternative.
- **Filters**: combine title/ID search, epic, assignee, priority and status.
  Sort by creation ID, priority or title. Sorting does not reorder saved data.
- **Backlog (`/backlog`)**: capture ideas or park existing work. Moving tasks
  between Backlog and Board preserves status and subtasks.
- **Archive (`/tasks/archive`)**: archive tasks from their details and restore them
  later. Archive/delete require confirmation and discard unsaved form changes.
  Undo is available for the most recent lifecycle action in the current view.
  Deleted records are retained in local storage for undo and to avoid reusing IDs.
- **Dashboard (`/dashboard`)**: saved task totals, Board workflow, epic progress
  and daily completed-task totals. History records UTC days when changes are
  successfully saved, keeping the newest 90 daily records. Earlier days are
  unknown; unchanged days carry the last known total. Completed totals include
  archived work and can decrease when tasks are reopened or deleted.

Subtask updates save immediately without changing the parent status. Creating
unused epics persists them too. The app starts with clearly labeled sample tasks.

## Storage and boundaries

Zod checks persisted data before loading. Existing workspaces migrate with defaults
for subtasks, epic catalogs, archive and placement; history is not invented.
Read failures pause mutations, while write failures keep drafts for retry. Storage
changes synchronize across tabs, and mutations reload the latest saved snapshot.
Browser storage has no atomic transaction between concurrent writers in different
tabs; this is a local workspace, not a shared collaboration service.
Storage is scoped to the browser and origin and does not sync across devices.
The existing backend uses a different task contract and is unchanged.

## Structure

- `src/app/(workspace)/`: thin Server Component routes and one shared shell layout.
  The route group does not change URLs or add a second sidebar.
- `src/shared/components/`: shell and active project navigation.
- `src/shared/ui/`: reusable Ark UI dialog surface.
- `src/features/tasks/components/task-workspace.tsx`: client controller composing
  filters, dialogs and the board/list views.
- `src/features/tasks/components/kanban-board.tsx`: drag/drop presentation.
- `src/features/tasks/components/task-form.tsx`: shared create/edit form.
- `src/features/tasks/schemas/`: Zod validation rules.
- `src/features/tasks/types/`: task, status, placement and subtask TypeScript types.
- `src/features/tasks/store/`: validated persistence, task operations and history.
- `src/features/tasks/hooks/`: React subscription to the task store.
- `src/features/tasks/lib/`: pure filtering/sorting rules and tests.
- `src/features/epics/`: epic dialog and validation.
- `src/features/dashboard/`: dashboard components and pure summary calculations.

TanStack Query is deferred until an API feature needs server-state caching. The
current browser store already owns persistence, so a second state layer is not
needed for these features.

## Checks

```bash
npm run lint
npm run test
npm run typecheck
npm run format:check
npm run build
```

Schema/store/summary tests use Node's test runner through tsx. If the environment
blocks Turbopack worker ports, use `npm run build -- --webpack`. Apply formatting
with `npm run format`.

Each feature has a separate stacked branch and local commit. PRs should target the
preceding feature branch until it merges, then be retargeted to the main branch.
Commit subjects follow `type / short description`, with a short structural body.

Task descriptions are optional plain text, limited to 5,000 characters. Create and edit share the same Zod rules. Existing workspaces migrate to empty descriptions.

Task labels are entered with commas (five unique names, 24 characters each) and get stable colors on cards. Due dates are calendar dates in the user’s local day; unfinished, unarchived tasks become overdue after that date. Filters combine labels and due dates; date sorting puts undated tasks last.

Task details include the latest 100 saved activity events. Changes to fields, subtasks and lifecycle actions are recorded in the same storage write as the task. Failed writes and no-op changes create no events; migrations never invent historical activity. This is local change history, not an authenticated audit log.

Sprint planning lives at `/sprints`, with validation, types, UI and progress calculations in `features/sprints/`. Create a dated sprint, add unassigned backlog tasks, and start it to move its scope to Board. Only one sprint can be active. Task details and filters expose sprint membership. Archive removes a task from its sprint; active sprint tasks must be unassigned before parking them. Completing a sprint saves a summary and carries unfinished tasks to Backlog, preserving their statuses and children. Completed summaries stay fixed when tasks are later reopened or deleted. Sprint dates are planned calendar dates; starting/completing are explicit actions.
