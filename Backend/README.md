# TaskFlow backend

Each feature lives in `src/modules/<feature>` and owns its routes, controllers,
services, repository, and types.

```text
src/
  app.ts
  server.ts
  modules/
    tasks/
      task.routes.ts
      task.controller.ts
      task.service.ts
      task.repository.ts
      task.types.ts
```

`app.ts` configures Express and mounts feature routers. `server.ts` starts the
listener using `PORT` (default: 5000). Keeping these separate allows the app to be
tested without starting the normal server.

Requests flow through routes → controller → service → repository. Controllers
handle HTTP, services provide a place for business rules, and repositories own
data access. The tasks repository currently stores sample data in memory; replace
its implementation with database access when persistence is needed.

`GET /api/tasks` returns the tasks as a JSON array.

- `npm run dev`: start the development watcher.
- `npm run build`: compile TypeScript into `dist`.
- `npm start`: run the compiled server.

Add future features (for example, users) alongside `tasks` and mount their routers
in `app.ts`. Keep feature-specific code inside its module; extract shared code
only when multiple features need it.
