'use client';

import { type ComponentType, type ReactNode } from 'react';
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

/**
 * Shared provider tree for both Pages Router (AppShell) and App Router (layout.tsx).
 *
 * Nesting order matches AppShell.tsx exactly:
 *   ErrorBoundary > LanguageProvider > ThemeProvider > TTSProvider > ToastProvider
 *   > OfflineProvider > AuthProvider > SocialProvider > SRSProvider > StateProvider
 *   > [RouterWrapper] > NavigationProvider > {children}
 *
 * The optional `routerWrapper` prop inserts a router component (e.g. BrowserRouter)
 * between StateProvider and NavigationProvider, matching the position of <Router>
 * in AppShell.tsx.
 */
interface ClientProvidersProps {
  children: ReactNode;
  routerWrapper?: ComponentType<{ children: ReactNode }>;
}

export function ClientProviders({ children, routerWrapper: RouterWrapper }: ClientProvidersProps) {
  const innerContent = <NavigationProvider>{children}</NavigationProvider>;

  const wrappedContent = RouterWrapper ? (
    <RouterWrapper>{innerContent}</RouterWrapper>
  ) : (
    innerContent
  );

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <TTSProvider>
            <ToastProvider>
              <OfflineProvider>
                <AuthProvider>
                  <SocialProvider>
                    <SRSProvider>
                      <StateProvider>{wrappedContent}</StateProvider>
                    </SRSProvider>
                  </SocialProvider>
                </AuthProvider>
              </OfflineProvider>
            </ToastProvider>
          </TTSProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
