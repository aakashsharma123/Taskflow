# TaskFlow implementation plan

Status: proposed product and engineering plan. This file describes future work;
it does not imply the features are implemented.

## Direction

Build an interview-ready team task-management application. The proposed scope
assumes users collaborate within projects; confirm this direction before
implementing membership and invitation flows.

The core demonstration is: sign in, create a project, add a teammate, create and
assign a task, move it through review, discuss it, and complete it. Demonstrate
permission enforcement and conflicting edits as well as the successful path.

## What to design first

Design frontend workflows first, at wireframe fidelity. Use those workflows to
define data requirements, permissions, and API contracts. Then implement one
complete workflow across the database, backend, and frontend before expanding.

Recommended sequence:

1. Sketch the project task list, task creation form, and task details screen.
2. Define loading, empty, validation, failure, and permission states.
3. Agree on the domain model and request/response examples.
4. Implement the minimum database and backend capabilities for that workflow.
5. Connect the frontend and test the complete flow.
6. Repeat for assignment, board interactions, comments, and activity.

Avoid finishing every backend endpoint before exercising the UI. Avoid polishing
every screen before validating data and authorization requirements.

## Current baseline

- Express and TypeScript backend with a feature-based tasks module.
- Separate application configuration and server startup.
- GET /api/tasks returns sample tasks from memory.
- No persistent storage, authentication, or frontend has been established.
- Existing tasks have numeric IDs, a title, and a completed boolean.

## Product scope

### Core release

- Account sign-in, sign-out, and session handling.
- Projects and project memberships with owner, member, and viewer roles.
- Task creation, details, editing, deletion, and assignment.
- Statuses: todo, in_progress, in_review, done.
- Priorities: low, medium, high, urgent.
- Optional descriptions, assignees, and due dates.
- Task list with search, filters, stable sorting, and pagination.
- Board view, comments, and task activity history.
- Detection of conflicting task edits.
- Persistent data, automated checks, deployment, and a seeded demonstration.

### Later enhancements

- Email invitations and notifications, real-time updates, file attachments.
- Labels, subtasks, recurring tasks, and advanced analytics.
- Multiple assignees and configurable workflows.

Implement membership management first. If invitations are added, specify token
expiry, intended recipient, acceptance, revocation, and role restrictions before
implementation. Do not silently treat an invitation as an active membership.

## Frontend workflows

| Screen | Main actions | Required states |
| --- | --- | --- |
| Sign-in | Authenticate, sign out | Invalid credentials, expired session |
| Project overview | Create or open a project | Loading, no projects, access denied |
| Task list | Search, filter, sort, create | Loading, empty project, no matches, retry |
| Task board | Move tasks between statuses | Saving, rollback, edit conflict |
| Task details | Edit, assign, set deadline, delete | Validation, not found, forbidden, conflict |
| Discussion/activity | Comment, inspect changes | Empty history, submitting, failed submission |
| My work | View assigned and overdue tasks | Cross-project permissions, empty results |

First design deliverable: task list, creation form, and details panel wireframes.
Keep filter state in the URL so users can share and revisit a view. Support keyboard
navigation and an accessible alternative to dragging board cards.

Initially wait for server confirmation before changing saved UI state. Add
optimistic board updates with rollback once error and conflict handling work.
Preserve user input after failures and prevent accidental duplicate submissions.

## Domain and persistence

Use a relational database with migrations, foreign keys, and transaction support.
PostgreSQL is the proposed database; select the migration/data-access library
before implementation. Choose frontend tooling after the first wireframes.

| Entity | Essential data |
| --- | --- |
| User | id, display name, email, authentication identity, timestamps |
| Project | id, name, description, timestamps |
| Membership | projectId, userId, role; unique project/user pair |
| Task | id, projectId, title, description, status, priority, assigneeId, createdById, dueDate, version, timestamps |
| Comment | id, taskId, authorId, body, timestamps |
| Activity | id, projectId, taskId, actorId, event type, changed fields, timestamp |

Use UUIDs for new persistent records. Replace completed with status and migrate
any retained sample data explicitly. Store event timestamps in UTC and dueDate
as a calendar date. Define the project timezone for overdue calculations.

Task defaults: todo status, medium priority, no assignee, no due date, version 1.
Derive the creator and activity actor from the authenticated session.

Start with title length 1-200 after trimming and description length up to 10,000.
Confirm these limits in the contract. Add indexes for demonstrated query patterns,
such as project/status and project/assignee; measure before adding more.

## Permissions and business rules

- Owners manage project settings and membership and may delete any project task.
- Members create and update project tasks and delete tasks they created.
- Viewers read project tasks and history; they cannot mutate data or comment.
- Owners and members may comment.
- Only project members may be assigned to project tasks.
- Removing a member must explicitly handle their assignments in a transaction.
- Prevent removing or demoting the final project owner.
- Authorize every request, including reads, using authenticated identity.
- Return 404 for inaccessible project/task resources to avoid exposing existence;
  return 403 for disallowed actions on resources the caller can already view.
- Initially allow transitions between any listed statuses, including reopening.
  Add transition restrictions only if a product requirement justifies them.

Proposed deletion behavior: confirm in the UI, hard-delete the task and its
comments, and retain a project activity event with a task snapshot. Define the
activity foreign-key behavior so history survives deletion. No undo is promised.

## API contract

Keep the requested /api/tasks endpoints. Creation accepts projectId in its body;
listing accepts a projectId filter. This replaces the earlier proposed nested
project-task URLs with one consistent route family.

| Method and path | Behavior | Success |
| --- | --- | --- |
| POST /api/tasks | Create in an authorized project | 201 with task and Location header |
| GET /api/tasks | List accessible tasks with filters and pagination | 200 with collection metadata |
| GET /api/tasks/:id | Read an accessible task | 200 with task |
| PATCH /api/tasks/:id | Update permitted fields using version | 200 with updated task |
| DELETE /api/tasks/:id | Delete with permission | 204 without response body |
| GET /api/tasks/:id/comments | Paginate comments | 200 |
| POST /api/tasks/:id/comments | Add a comment | 201 |
| GET /api/tasks/:id/activity | Paginate activity | 200 |

Design auth, projects, and membership contracts during the foundation milestone.

Example create body:

```json
{
  "projectId": "project-uuid",
  "title": "Implement password reset",
  "description": "Allow users to request a reset link.",
  "priority": "high",
  "assigneeId": "user-uuid",
  "dueDate": "2026-11-20"
}
```

Example PATCH body:

```json
{
  "status": "in_review",
  "version": 3
}
```

- Omitted fields stay unchanged; null clears an optional field.
- Reject unknown fields, invalid values, immutable fields, and empty updates.
- projectId and createdById cannot be changed through task PATCH.
- Require the last seen version for PATCH and atomically compare/increment it.
- A stale version returns 409; the frontend retains the draft and offers refresh.
- Save mutations and corresponding activity events in one database transaction.
- Validate IDs and request bodies at the boundary.

Error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the submitted fields.",
    "fields": { "title": "Title is required." },
    "requestId": "request-id"
  }
}
```

Use 400 for invalid input, 401 for unauthenticated requests, 403 for forbidden
actions, 404 for missing/inaccessible resources, 409 for conflicts, and a generic
500 response for unexpected failures. Do not return internal stack traces.

List queries support projectId, status, assigneeId, priority, search, due-date
range, and allowlisted sort fields. Start with page/limit pagination, a default
limit of 20 and maximum of 100, and a deterministic ID tiebreaker. Return items,
page, limit, and total. Apply identical authorization and filters to counts.
Board status totals must not be calculated from a single paginated page.

## Feature-based architecture

```text
Backend/src/
  app.ts
  server.ts
  modules/
    auth/
    users/
    projects/
    tasks/
      task.routes.ts
      task.validation.ts
      task.controller.ts
      task.service.ts
      task.repository.ts
      task.types.ts
    comments/
    activity/
  shared/
    database/
    errors/
    middleware/
Frontend/src/
  app/
  features/
    auth/
    projects/
    tasks/
    comments/
  shared/
    ui/
    api/
```

This is a modular monolith. Feature code stays inside its feature; shared folders
hold only genuinely reused infrastructure. Create folders when their code exists.
Routes map requests, controllers translate HTTP, services enforce business rules,
and repositories handle persistence. Transaction boundaries belong to the use
case and must encompass every participating repository operation.

## Implementation milestones

### 1. Workflow and contract design

- [ ] Confirm the collaborative-project scope and role matrix.
- [ ] Sketch list, creation, and details screens with failure states.
- [ ] Finalize task fields, date semantics, deletion, and validation rules.
- [ ] Document API examples and relational schema.

Done when one task workflow can be described from user action through response,
including failures, without unresolved behavior decisions.

### 2. Foundation and first complete workflow

- [ ] Select authentication/session strategy and frontend tooling.
- [ ] Add database migrations, development seeds, and environment validation.
- [ ] Implement sign-in, project creation, membership, and authorization.
- [ ] Connect frontend task creation, list, and details to persistent APIs.

Done when a signed-in user creates a task, sees it after restart, and another
unauthorized user cannot read or modify it.

### 3. Task lifecycle

- [ ] Add PATCH and DELETE with permission checks and validation.
- [ ] Add assignment, priority, due dates, and status editing.
- [ ] Add atomic version checks and transactional activity events.
- [ ] Add frontend conflict, validation, deletion, and retry behavior.

Done when updates survive reloads and simultaneous edits cannot silently overwrite
each other.

### 4. Discovery and collaboration

- [ ] Add list filters, search, sorting, pagination, and URL state.
- [ ] Add board view with correct totals and rollback on failure.
- [ ] Add comments, activity display, and My work.
- [ ] Add membership management UI and assignment cleanup on member removal.

Done when two users can carry a task through the full collaboration workflow.

### 5. Release and interview preparation

- [ ] Integration tests for authorization, validation, pagination, and persistence.
- [ ] Tests for stale edits and rollback of task/activity transactions.
- [ ] End-to-end test for the main user workflow.
- [ ] API documentation, setup instructions, architecture decisions, and seed data.
- [ ] CI for type checking, tests, and builds.
- [ ] Structured request logging, health checks, graceful shutdown, and deployment.
- [ ] Authentication abuse limits, secret handling, and session/CSRF protections
      appropriate to the selected authentication design.
- [ ] Document migration execution, backup/restore, and demo-account reset.

Done when a reviewer can run the project from the README and the hosted demo
supports the documented workflow.

## Interview demonstration

Prepare two users, a project, and realistic tasks. Show task creation and
assignment, filtering, a status change, a discussion, and the activity history.
Then demonstrate a rejected unauthorized request and a conflicting edit.

Explain the reasons for feature boundaries, a relational schema, transactional
activity, optimistic concurrency, and choosing one deployable backend. Document
limitations honestly, including pagination tradeoffs and deferred capabilities.

## Immediate next step

Design the task list, creation form, and details panel together, then finalize the
first API contract. Implementation should follow those agreed workflows.
