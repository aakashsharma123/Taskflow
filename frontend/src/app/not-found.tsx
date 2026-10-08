import Link from "next/link";
import { OrbitMark } from "@/shared/ui/orbit-mark";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <OrbitMark className="mx-auto mb-6 size-16 text-secondary" />
        <p className="text-xs font-medium text-base-content/65">404 · Orbit</p>
        <h1 className="mt-3 text-3xl font-semibold">A little off course.</h1>
        <p className="mt-3 text-sm leading-7 text-base-content/65">
          This page doesn’t exist. Head back to your workspace to keep things
          moving.
        </p>
        <Link href="/tasks" className="btn btn-primary mt-6 rounded-xl">
          Back to Orbit
        </Link>
      </div>
    </main>
  );
}
