'use client';

import { redirect, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { NavigationShell } from '@/components/navigation/NavigationShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    // Validate returnTo is a safe relative path (open redirect prevention)
    const safeReturnTo =
      pathname && pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : undefined;
    const authUrl = safeReturnTo ? `/auth?returnTo=${encodeURIComponent(safeReturnTo)}` : '/auth';
    redirect(authUrl);
  }

  return <NavigationShell>{children}</NavigationShell>;
}
