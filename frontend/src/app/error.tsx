"use client";
export default function WorkspaceError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto mt-12 max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 text-center"
    >
      <h1 className="text-xl font-semibold">We couldn’t open this view.</h1>
      <p className="mt-3 text-xs leading-6 text-base-content/65">
        Try again to reload the page.
      </p>
      <button
        type="button"
        onClick={retry}
        className="btn btn-primary btn-sm mt-5 rounded-xl"
      >
        Try again
      </button>
    </div>
  );
}
