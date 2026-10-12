import { SectionMessage } from "./section-message";

export function LoadError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <SectionMessage tone="error" role="alert" className={className}>
      <p>{message}</p>
      <button
        type="button"
        className="mt-2 font-medium text-primary hover:underline"
        onClick={onRetry}
      >
        Try again
      </button>
    </SectionMessage>
  );
}
