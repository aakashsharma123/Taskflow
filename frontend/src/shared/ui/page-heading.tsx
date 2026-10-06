import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7">
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-base-content/65">
        {description}
      </p>
    </header>
  );
}
