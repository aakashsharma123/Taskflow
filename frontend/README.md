# Orbit frontend

Frontend-only project workspace using Next.js App Router, strict TypeScript,
Ark UI dialogs and tabs, Tailwind CSS, DaisyUI, Zod and dnd-kit. Poppins is self-hosted.
The `@/*` alias resolves to `src/*`.

## Run locally

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The home route redirects to `/tasks`.
No backend or environment variables are required.

## Features

- **My Work (`/my-work`)**: select a local member and see assignments across
  Board and Backlog, grouped into overdue, today, upcoming and undated work.
  Archived work stays out; completed tasks have a separate expandable section.
- **Workspace search**: use the shared header or Ctrl/Cmd K to find tasks,
  including archived tasks, by ID, title, description, labels, epic or assignee.
  All search terms must match. Epic and sprint results link to their views.
- **Epics (`/epics`, `/epics/[name]`)**: linked tasks, completion progress,
  status/archive filters and new tasks that start in Backlog. Rename updates
  every reference. Confirmed removal clears assignments while keeping tasks,
  subtasks, archived work and deleted undo records.
- **Board (`/tasks`)**: create/edit tasks and one-level subtasks. Move cards
  between columns using their handles. Space starts a keyboard drag, arrows move
  it, Space drops it and Escape cancels. The task status field is an alternative.
- **Task details**: optional plain text descriptions (5,000 characters), up to
  five unique labels (24 characters each), and calendar due dates. Unfinished,
  unarchived work becomes overdue after its due date in the user's local day.
- **Filters**: combine title/ID search, epic, assignee, priority, status, label,
  due date and sprint. Sort by creation ID, priority, title or due date, with
  undated work last. Sorting does not reorder saved data.
- **Discussion**: add, edit or remove plain text comments from task details.
  Comments have stable IDs, local authors and timestamps, with a limit of
  200 comments per task and 2,000 characters per comment. They save immediately;
  failed writes keep drafts. Display names do not imply authenticated identity.
- **Subtasks**: add, complete, rename and remove child steps. Removal requires
  confirmation; changes preserve the parent task's workflow status.
- **Activity**: the latest 100 saved events per task cover field changes, subtasks,
  sprint membership and lifecycle actions. Events save with the task; failed writes
  and no-op changes create no events. This is local history, not an authenticated
  audit log.
- **Backlog (`/backlog`)**: capture ideas or park existing work. Moving tasks
  between Backlog and Board preserves status and subtasks. Remove a task from
  its active sprint before parking it.
- **Sprints (`/sprints`)**: create a dated sprint with a goal and assign backlog
  tasks. Starting moves its scope to Board; only one sprint can be active.
  Completion requires confirmation, saves a summary and returns unfinished
  tasks to Backlog with their statuses and children intact. Completed summaries
  stay fixed when tasks are later reopened or deleted. Dates describe the planned
  schedule; start and completion are explicit actions.
- **Archive (`/tasks/archive`)**: archive tasks from their details and restore them
  later. Archive/delete require confirmation and discard unsaved form changes.
  Archiving removes sprint membership. Undo is available for the most recent
  lifecycle action across workspace routes. Deleted records are retained in local
  storage for undo and to avoid reusing IDs.
- **Dashboard (`/dashboard`)**: saved task totals, Board workflow, epic progress
  and daily completed-task totals. History records UTC days when changes are
  successfully saved, keeping the newest 90 daily records. Earlier days are
  unknown; unchanged days carry the last known total. Completed totals include
  archived work and can decrease when tasks are reopened or deleted. Sprint
  outcomes use immutable completion snapshots, not simulated burndown data.
- **Settings (`/settings`)**: project name, up to 50 local assignee names, and
  apricot, sage or lavender accents. Confirmed member removal unassigns live,
  archived and deleted undo records together. These are local display names,
  not accounts or invitations. Appearance also applies to portal dialogs.
- **Data backup**: download the complete workspace as JSON from Settings.
  Restore validates schemas, IDs and catalog references and requires confirmation
  before replacement. A valid backup can recover corrupt browser data. Start fresh
  clears work and history after confirmation while keeping project settings and
  member names. Workspace data and backup files are limited to 10 MB; browser
  storage may have a lower quota.

Subtask changes save immediately without changing the parent status. Sprint
assignment and task location actions also save immediately and discard unsaved
form edits, as explained beside those controls. Creating unused epics and members
persists them too. The app starts with clearly labeled sample tasks.

## Storage and boundaries

Zod checks persisted data before loading. Existing workspaces migrate with defaults
for new task fields, catalogs, sprints and settings; history is not invented.
Read failures pause mutations, while write failures keep drafts for retry.
One workspace provider owns the store across all routes. Same-tab updates appear
immediately, storage events synchronize other tabs, and window focus refreshes
saved changes. Mutations reload the latest snapshot before writing.
Explicit replacement changes the workspace identity so stale task dialogs and
undo actions cannot operate on a restored or cleared dataset.

Browser storage has no atomic transaction between concurrent writers in different
tabs; this is a local workspace, not a shared collaboration service.
Storage is scoped to the browser and origin and does not sync across devices.
The existing backend uses a different task contract and is unchanged.

## Structure

- `src/app/(workspace)/`: thin Server Component routes and one shared shell layout.
  The route group does not change URLs or add a second sidebar.
- `src/shared/components/`: shell and active project navigation.
- `src/shared/ui/`: reusable Ark UI dialog surface, Orbit mark and page heading.
- `src/features/workspace/`: shared store provider, loading/error state,
  persisted schema and backup validation.
- `src/features/tasks/components/task-workspace.tsx`: client controller composing
  filters and the board/list views.
- `src/features/tasks/components/task-actions-provider.tsx`: shared task details,
  notification and lifecycle undo for Board, My Work, search and epic routes.
- `src/features/tasks/components/kanban-board.tsx`: drag/drop presentation.
- `src/features/tasks/components/task-form.tsx`: shared create/edit form.
- `src/features/tasks/schemas/`: task and metadata Zod validation rules.
- `src/features/tasks/types/`: task, status, placement, activity and subtask types.
- `src/features/workspace/store/`: persistence and validated workspace commands.
- `src/features/tasks/lib/task-activity.ts`: pure task change descriptions.
- `src/features/dashboard/lib/workspace-history.ts`: saved daily totals.
- `src/features/tasks/lib/`: pure filtering, sorting and calendar-date rules.
- `src/features/sprints/`: sprint forms, cards, schemas, types and pure commands.
- `src/features/settings/`: settings forms, member management and accent options.
- `src/features/epics/`: epic collection, detail views and validation.
- `src/features/my-work/`: personal focus view and pure urgency grouping.
- `src/features/search/`: search dialog and pure matching rules.
- `src/features/dashboard/`: dashboard components and pure summary calculations.

Tests sit beside the schema, store and calculation code they verify.
TanStack Query is deferred until an API feature needs server-state caching. The
browser store already owns persistence; no additional state layer is needed.

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
