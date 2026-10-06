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
The current checkpoint is a responsive workspace shell and a four-column task board
using local sample data. Search and epic filtering work locally. Cards are read-only;
dragging and task details will come later. No backend or environment variables are required.
The frontend board uses a status field; the existing backend still uses completed.

## Checks

```bash
npm run lint
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
