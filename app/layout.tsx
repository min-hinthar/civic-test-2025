/**
 * Minimal App Router root layout.
 *
 * The main application is still served via the Pages Router (pages/[[...slug]].tsx).
 * This layout exists only to satisfy Next.js App Router requirements for:
 * - app/global-error.tsx (error boundary)
 * - app/dev-sentry-test/page.tsx (dev-only Sentry test page)
 *
 * It does NOT replace or interfere with the Pages Router shell.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
