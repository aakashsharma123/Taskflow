import type { Metadata } from "next";
import { EpicDetail } from "@/features/epics/components/epic-detail";
export const metadata: Metadata = { title: "Epic details | Orbit" };
export default async function EpicPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <EpicDetail key={name} name={name} />;
}
