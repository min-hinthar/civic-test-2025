'use client';

import { type ReactNode, useEffect } from 'react';
import { installHistoryGuard } from '@/lib/historyGuard';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SRSProvider } from '@/contexts/SRSContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { StateProvider } from '@/contexts/StateContext';
import { TTSProvider } from '@/contexts/TTSContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/BilingualToast';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';
import { useViewportHeight } from '@/lib/useViewportHeight';
import { cleanExpiredSessions } from '@/lib/sessions/sessionStore';

// Install history guard before component mounts -- catches Safari SecurityError
// from rate-limited replaceState/pushState calls so they don't crash navigation.
installHistoryGuard();

/**
 * Shared client-side provider tree for App Router layout.tsx.
 *
 * Nesting order:
 *   ErrorBoundary > AuthProvider > LanguageProvider > ThemeProvider > TTSProvider
 *   > ToastProvider > OfflineProvider > SocialProvider > SRSProvider > StateProvider
 *   > NavigationProvider > {children}
 *
 * AuthProvider must be above Language/Theme/TTS providers because they
 * call useAuth() for cross-device settings sync.
 * OfflineProvider must be inside ToastProvider (uses useToast).
 */
interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useViewportHeight();

  // Clean expired session snapshots from IndexedDB on app startup
  useEffect(() => {
    cleanExpiredSessions().catch(() => {
      // IndexedDB not available
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TTSProvider>
              <ToastProvider>
                <OfflineProvider>
                  <SocialProvider>
                    <SRSProvider>
                      <StateProvider>
                        <NavigationProvider>{children}</NavigationProvider>
                      </StateProvider>
                    </SRSProvider>
                  </SocialProvider>
                </OfflineProvider>
              </ToastProvider>
            </TTSProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
