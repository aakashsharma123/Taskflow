# TaskFlow frontend

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
The current checkpoint is a responsive workspace shell and a static task-page
placeholder. It does not fetch task data or require a backend or environment variables.

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
- `src/app/globals.css`: theme tokens, base styles, and decorative illustration.
- `src/shared/components/workspace-shell.tsx`: desktop sidebar, mobile navigation,
  header, and skip link. Mobile navigation uses native disclosure behavior.
- `src/app/tasks/layout.tsx`: applies the workspace shell to task routes.
- `src/app/tasks/page.tsx`: task-page heading and introductory placeholder.

These are Server Components; no client state is needed for this checkpoint.
Feature modules and additional libraries will be introduced with their first use cases.
