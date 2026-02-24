import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
      <h2 className="mb-4 text-xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mb-6 text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90">
        Go Home
      </Link>
    </div>
  );
}
