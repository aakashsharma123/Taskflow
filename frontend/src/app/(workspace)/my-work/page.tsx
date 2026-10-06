import type { Metadata } from "next";
import { MyWork } from "@/features/my-work/components/my-work";
import { PageHeading } from "@/shared/ui/page-heading";
export const metadata: Metadata = { title: "My Work | Orbit" };
export default function MyWorkPage() {
  return (
    <>
      <PageHeading
        title="My Work"
        description="A little clarity for your day. Keep assignments and deadlines within reach."
      />
      <MyWork />
    </>
  );
}
