import type { Metadata } from "next";
import { EpicWorkspace } from "@/features/epics/components/epic-workspace";
import { PageHeading } from "@/shared/ui/page-heading";
export const metadata: Metadata = { title: "Epics | Orbit" };
export default function EpicsPage() {
  return (
    <>
      <PageHeading
        title="Epics"
        description="Bring related work together. Turn the bigger picture into achievable steps."
      />
      <EpicWorkspace />
    </>
  );
}
