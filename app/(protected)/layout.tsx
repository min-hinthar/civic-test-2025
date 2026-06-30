'use client';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { NavigationShell } from '@/components/navigation/NavigationShell';

/**
 * App shell layout. Renders the full navigation experience for everyone —
 * signed-in users and guests alike. No-account visitors get full study
 * functionality (flashcards, mock tests, interview, progress) backed by
 * local storage, so the app stays usable even if Supabase auth is
 * unavailable. Account-only features (cross-device sync, leaderboard)
 * surface their own in-context sign-in prompts.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <NavigationShell>{children}</NavigationShell>;
}
