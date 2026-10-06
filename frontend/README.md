# Orbit frontend

Next.js App Router with strict TypeScript, Tailwind CSS, DaisyUI, ESLint, and
Prettier. Poppins (400, 500, and 600) is self-hosted through Fontsource. The `@/*`
import alias resolves to `src/*`.

## Run locally

From this directory:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The home route redirects to `/tasks`.
The board starts with sample tasks. Create tasks, open their titles to edit details,
and change status to move them between columns. Create epics through the Epics
button, assign tasks to them, and use the epic filter to focus the board. Add and
complete subtasks inside task details. Subtask changes save immediately; completing
all subtasks does not change the parent task’s status.

The workspace is saved in this browser and synchronized across tabs. Saved data is
checked with Zod before loading. Read failures pause changes; write failures leave
drafts open for retry. Earlier saved tasks migrate with empty subtask lists and an
epic catalog derived from their existing epic labels. Titles are trimmed and limited
to 120 characters; epic names must be unique and at most 60 characters.

No backend or environment variables are required. The frontend uses status; the
existing backend still uses completed. Browser storage is local to this browser and
origin; it does not sync across devices.

## Checks

```bash
npm run lint
npm run test
npm run typecheck
npm run format:check
npm run build
```

If your execution environment blocks Turbopack's local worker ports, run
`npm run build -- --webpack` to verify the production build with Webpack.
Use `npm run format` to apply formatting.

## Review guide

- `src/app/layout.tsx`: root layout, font imports, and metadata.
- `src/app/globals.css`: theme tokens, base styles, and workspace decoration.
- `src/shared/components/workspace-shell.tsx`: desktop sidebar, mobile navigation,
  header, and skip link. Mobile navigation uses native disclosure behavior.
- `src/app/tasks/layout.tsx`: applies the workspace shell to task routes.
- `src/app/tasks/page.tsx`: board heading and sample data composition.
- `src/features/tasks/components/task-board.tsx`: columns and local search/filter state.
- `src/features/tasks/components/task-card.tsx`: task summary, details trigger, and subtask progress.
- `src/features/tasks/components/task-form.tsx`: shared create/edit form and field errors.
- `src/features/tasks/components/task-details-dialog.tsx`: editing and subtask composition.
- `src/features/tasks/components/subtask-list.tsx`: one-level subtask controls.
- `src/features/epics/`: epic dialog and name validation.
- `src/shared/ui/dialog-panel.tsx`: shared Ark UI dialog surface.
- `src/features/tasks/types/task.ts`: the current task data contract.
- `src/features/tasks/data/sample-tasks.ts`: explicitly labeled preview data.

The shell and route are Server Components. TaskBoard is a Client Component because
its search and epic filters use local React state.
Additional libraries will be introduced with their first use cases.

Task validation lives in `src/features/tasks/schemas/create-task-schema.ts`. The
dialog reads native form values and displays errors; the schema owns the rules.

Schema and store tests use Node’s test runner through tsx to run TypeScript.

Browser persistence lives in `features/tasks/store/task-store.ts`; the React
subscription lives in `features/tasks/hooks/use-task-store.ts`.

Move cards between columns using the drag handle. dnd-kit supports pointer, touch,
and keyboard input: Space starts a drag, arrows move it, Space drops it, and Escape
cancels. The status field in task details is also available for direct changes.
