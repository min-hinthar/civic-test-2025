'use client';

import { type ReactNode, useEffect, useRef } from 'react';
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
import { ToastProvider, useToast } from '@/components/BilingualToast';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';
import { useSWUpdate } from '@/hooks/useSWUpdate';
import { useViewportHeight } from '@/lib/useViewportHeight';
import { cleanExpiredSessions } from '@/lib/sessions/sessionStore';
import { ProviderOrderGuard } from '@/lib/providerOrderGuard';

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
/**
 * SW update watcher -- shows persistent bilingual toast when update detected.
 * Must be inside NavigationProvider (reads isLocked) and ToastProvider (shows toast).
 * NOT a provider -- does not affect provider ordering.
 */
function SWUpdateWatcher() {
  const { updateAvailable, acceptUpdate } = useSWUpdate();
  const { showPersistent, dismiss } = useToast();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (updateAvailable && !toastIdRef.current) {
      toastIdRef.current = showPersistent(
        'info',
        {
          en: 'A new version is available',
          my: '\u1021\u1015\u103a\u1012\u102d\u1010\u103a\u101a\u1030\u1005\u1019\u103a\u1038\u200b\u1021\u101e\u1005\u103a\u200b\u101b\u101b\u103e\u102d\u1015\u102b\u200b\u1015\u103c\u102e',
        },
        {
          label: {
            en: 'Update now',
            my: '\u101a\u1001\u102f\u200b\u1021\u1015\u103a\u1012\u102d\u1010\u103a\u101c\u102f\u1015\u103a\u1019\u100a\u103a',
          },
          onClick: acceptUpdate,
        }
      );
    }
    return () => {
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [updateAvailable, acceptUpdate, showPersistent, dismiss]);

  return null;
}

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
                        <NavigationProvider>
                          {process.env.NODE_ENV === 'development' && <ProviderOrderGuard />}
                          <SWUpdateWatcher />
                          {children}
                        </NavigationProvider>
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
