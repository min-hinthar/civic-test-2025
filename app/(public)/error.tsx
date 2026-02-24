'use client';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="mb-6 text-secondary">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
}
