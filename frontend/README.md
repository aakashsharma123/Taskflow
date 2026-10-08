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
The board starts with sample tasks. New tasks are validated with Zod, added to their
status column, and saved in this browser. Saved data is checked before loading;
read failures pause changes, and write failures keep the form open for retry.
Tasks synchronize across tabs. No backend or environment variables are required.
Titles are trimmed and limited to 120 characters. Empty epic and assignee selections
become null. The frontend uses status; the existing backend still uses completed.

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
- `src/features/tasks/components/task-card.tsx`: reusable card with typed task props.
- `src/features/tasks/types/task.ts`: the current task data contract.
- `src/features/tasks/data/sample-tasks.ts`: explicitly labeled preview data.

The shell and route are Server Components. TaskBoard is a Client Component because
its search and epic filters use local React state.
Additional libraries will be introduced with their first use cases.

Task validation lives in `src/features/tasks/schemas/create-task-schema.ts`. The
dialog reads native form values and displays errors; the schema owns the rules.

Schema tests use Node’s test runner through tsx to run TypeScript.

Browser persistence lives in `features/tasks/store/task-store.ts`; the React
subscription lives in `features/tasks/hooks/use-task-store.ts`.
