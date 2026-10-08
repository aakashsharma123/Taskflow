import { workspaceSchema } from "../schemas/workspace-schema";

export function assertWorkspaceSize(raw: string) {
  if (new TextEncoder().encode(raw).byteLength > 10 * 1024 * 1024)
    throw new Error("Workspace backups must be smaller than 10 MB.");
}

export function parseWorkspaceBackup(raw: string) {
  assertWorkspaceSize(raw);
  const saved = workspaceSchema.parse(JSON.parse(raw));
  const allTasks = [...saved.tasks, ...saved.removedTasks];
  if (new Set(allTasks.map((task) => task.id)).size !== allTasks.length)
    throw new Error("Duplicate task IDs");
  const epics = workspaceSchema.shape.epics
    .unwrap()
    .parse(
      saved.epics ?? [
        ...new Set(allTasks.flatMap((task) => (task.epic ? [task.epic] : []))),
      ],
    );
  const settings = workspaceSchema.shape.settings.unwrap().parse(
    saved.settings ?? {
      projectName: "Orbit",
      appearance: "apricot" as const,
      currentMember: null,
      members: [
        ...new Set(
          allTasks.flatMap((task) => (task.assignee ? [task.assignee] : [])),
        ),
      ],
    },
  );
  for (const task of allTasks) {
    if (task.epic !== null && !epics.includes(task.epic))
      throw new Error("Unknown epic reference");
    if (task.assignee !== null && !settings.members.includes(task.assignee))
      throw new Error("Unknown member reference");
    if (
      task.sprintId !== null &&
      !saved.sprints.some((sprint) => sprint.id === task.sprintId)
    )
      throw new Error("Unknown sprint reference");
  }
  if (
    saved.tasks.some(
      (task) =>
        task.sprintId !== null &&
        (task.archived ||
          (saved.sprints.find((sprint) => sprint.id === task.sprintId)
            ?.status === "active" &&
            task.placement !== "board")),
    )
  )
    throw new Error("Invalid sprint membership");
  return { ...saved, epics, settings };
}
