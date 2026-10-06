import type { Task } from "@/features/tasks/types/task";
import type { Sprint } from "@/features/sprints/types/sprint";
export function searchWorkspace(
  tasks: Task[],
  epics: string[],
  sprints: Sprint[],
  query: string,
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = (text: string) =>
    words.every((word) => text.toLocaleLowerCase().includes(word));
  if (!words.length) return { tasks: [], epics: [], sprints: [] };
  return {
    tasks: tasks
      .filter((task) =>
        matches(
          [
            `ORB-${task.id}`,
            task.title,
            task.description,
            ...task.labels,
            task.epic ?? "",
            task.assignee ?? "",
          ].join(" "),
        ),
      )
      .sort((a, b) => Number(a.archived) - Number(b.archived) || b.id - a.id),
    epics: epics.filter(matches),
    sprints: sprints.filter((sprint) =>
      matches(`${sprint.name} ${sprint.goal}`),
    ),
  };
}
