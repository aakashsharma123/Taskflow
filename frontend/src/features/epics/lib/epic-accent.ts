import { accentAt } from "@/shared/lib/accent";

export function epicAccent(epics: readonly string[], epic: string) {
  return accentAt(epics.indexOf(epic));
}
