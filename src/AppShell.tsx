'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Head from 'next/head';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
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
import { PageTransition } from '@/components/animations/PageTransition';
import { useViewportHeight } from '@/lib/useViewportHeight';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { WelcomeModal } from '@/components/pwa/WelcomeModal';
import { IOSTip, shouldShowIOSTip } from '@/components/pwa/IOSTip';
import { SyncStatusIndicator } from '@/components/pwa/SyncStatusIndicator';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import TestPage from '@/pages/TestPage';
import StudyGuidePage from '@/pages/StudyGuidePage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PasswordResetPage from '@/pages/PasswordResetPage';
import PasswordUpdatePage from '@/pages/PasswordUpdatePage';
import OpEdPage from '@/pages/OpEdPage';
import AboutPage from '@/pages/AboutPage';
import SettingsPage from '@/pages/SettingsPage';
import HubPage from '@/pages/HubPage';
import PracticePage from '@/pages/PracticePage';
import InterviewPage from '@/pages/InterviewPage';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { WhatsNewModal, useWhatsNew } from '@/components/update/WhatsNewModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';
import { NavigationShell } from '@/components/navigation/NavigationShell';
import { cleanExpiredSessions } from '@/lib/sessions/sessionStore';
import { CelebrationOverlay } from '@/components/celebrations';

/**
 * Hook to detect if running on client side.
 * Uses useSyncExternalStore for proper hydration support.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    // Subscribe function - no-op since this never changes
    () => () => {},
    // Client snapshot - always true on client
    () => true,
    // Server snapshot - always false on server
    () => false
  );
}

/**
 * PWA Onboarding Flow
 *
 * Manages install prompt, welcome modal, and iOS tip lifecycle:
 * 1. First visit: InstallPrompt appears immediately
 * 2. User installs: InstallPrompt closes, WelcomeModal appears
 * 3. User dismisses install: prompt hidden for 7 days
 * 4. Returning installed user (never seen welcome): WelcomeModal appears once
 * 5. iOS Safari users: one-time friendly tip about weekly visits (after onboarding)
 */
function PWAOnboardingFlow() {
  // Determine initial welcome state: show if installed but never shown welcome
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('pwa-installed') === 'true';
    const welcomeShown = localStorage.getItem('welcome-shown') === 'true';
    return isInstalled && !welcomeShown;
  });

  const [hideInstallPrompt, setHideInstallPrompt] = useState(false);

  // Lazy initializer: returning iOS user with no onboarding needed sees tip immediately
  const [showIOSTip, setShowIOSTip] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Show immediately only if no welcome flow is pending
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('pwa-installed') === 'true';
    const welcomeShown = localStorage.getItem('welcome-shown') === 'true';
    const welcomeNeeded = isInstalled && !welcomeShown;
    // If no welcome is needed and iOS tip is eligible, show right away
    return !welcomeNeeded && shouldShowIOSTip();
  });

  const handleInstalled = () => {
    // User just installed - hide install prompt, show welcome
    setHideInstallPrompt(true);
    setShowWelcome(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // After welcome closes, check if we should show iOS tip (with delay)
    if (shouldShowIOSTip()) {
      setTimeout(() => setShowIOSTip(true), 2000);
    }
  };

  return (
    <>
      {!hideInstallPrompt && !showWelcome && <InstallPrompt onInstalled={handleInstalled} />}
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      {/* iOS tip - shows after onboarding flow, as a non-blocking bottom banner */}
      {showIOSTip && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
          <IOSTip onDismiss={() => setShowIOSTip(false)} />
        </div>
      )}
    </>
  );
}

/**
 * Redirect helper that shows a brief loading spinner before navigating.
 * Used for old routes that redirect to hash-based destinations (e.g. /history -> /hub#history).
 */
function RedirectWithLoading({ to }: { to: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      <Navigate to={to} replace />
    </div>
  );
}

/**
 * Greeting flow: Welcome → What's New → (then tour runs independently).
 *
 * - Welcome shows on every sign-in (detects user transition from null → non-null).
 * - After welcome is dismissed, What's New shows if eligible (one-time, localStorage).
 * - The onboarding tour runs after both are done (it gates on localStorage independently).
 */
function GreetingFlow() {
  const { user } = useAuth();
  const { showWhatsNew, dismissWhatsNew } = useWhatsNew();

  // Track user transitions to detect sign-in events
  // (React-approved "adjust state when props change" pattern — no effects needed)
  const [prevUserId, setPrevUserId] = useState<string | null>(user?.id ?? null);
  const [showWelcome, setShowWelcome] = useState(!!user);

  const currentUserId = user?.id ?? null;
  if (currentUserId !== prevUserId) {
    setPrevUserId(currentUserId);
    // User signed in → show welcome; signed out → reset
    setShowWelcome(!!currentUserId);
  }

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  // Welcome screen gates What's New — early return ensures sequencing
  if (showWelcome && user) {
    return <WelcomeScreen onComplete={handleWelcomeDismiss} />;
  }

  // Show What's New after welcome, if eligible and onboarding is done
  const isOnboardingComplete = localStorage.getItem('civic-test-onboarding-complete') === 'true';
  if (showWhatsNew && isOnboardingComplete) {
    return <WhatsNewModal onClose={dismissWhatsNew} />;
  }

  return null;
}

// Install history guard before Router mounts — catches Safari SecurityError from rate-limited
// replaceState/pushState calls so they don't crash React Router's internal navigation.
installHistoryGuard();

const AppShell = () => {
  const isClient = useIsClient();

  useViewportHeight();

  // Clean expired session snapshots from IndexedDB on app startup
  useEffect(() => {
    cleanExpiredSessions().catch(() => {
      // IndexedDB not available
    });
  }, []);

  if (!isClient) {
    return null;
  }

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
                      <StateProvider>
                        <Router>
                          <NavigationProvider>
                            <Head>
                              <title>Civic Test Prep - Master Your U.S. Citizenship Test</title>
                              <meta
                                name="description"
                                content="Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking."
                              />
                            </Head>
                            <ErrorBoundary>
                              <NavigationShell>
                                <PageTransition>
                                  <Routes>
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/auth" element={<AuthPage />} />
                                    <Route path="/auth/forgot" element={<PasswordResetPage />} />
                                    <Route
                                      path="/auth/update-password"
                                      element={<PasswordUpdatePage />}
                                    />
                                    <Route path="/op-ed" element={<OpEdPage />} />
                                    <Route path="/about" element={<AboutPage />} />

                                    {/* New canonical routes */}
                                    <Route
                                      path="/home"
                                      element={
                                        <ProtectedRoute>
                                          <Dashboard />
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/hub/*"
                                      element={
                                        <ProtectedRoute>
                                          <HubPage />
                                        </ProtectedRoute>
                                      }
                                    />

                                    {/* Redirects from old routes to new canonical routes */}
                                    <Route
                                      path="/dashboard"
                                      element={<Navigate to="/home" replace />}
                                    />
                                    <Route
                                      path="/progress"
                                      element={<Navigate to="/hub/overview" replace />}
                                    />
                                    <Route
                                      path="/history"
                                      element={<RedirectWithLoading to="/hub/history" />}
                                    />
                                    <Route
                                      path="/social"
                                      element={<RedirectWithLoading to="/hub/achievements" />}
                                    />

                                    {/* Existing routes (unchanged) */}
                                    <Route
                                      path="/test"
                                      element={
                                        <ProtectedRoute>
                                          <TestPage />
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/study"
                                      element={
                                        <ProtectedRoute>
                                          <StudyGuidePage />
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/practice"
                                      element={
                                        <ProtectedRoute>
                                          <PracticePage />
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/interview"
                                      element={
                                        <ProtectedRoute>
                                          <InterviewPage />
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/settings"
                                      element={
                                        <ProtectedRoute>
                                          <SettingsPage />
                                        </ProtectedRoute>
                                      }
                                    />

                                    {/* Catch-all */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                  </Routes>
                                </PageTransition>
                              </NavigationShell>
                            </ErrorBoundary>
                            <CelebrationOverlay />
                            <PWAOnboardingFlow />
                            <OnboardingTour />
                            <GreetingFlow />
                            <SyncStatusIndicator />
                          </NavigationProvider>
                        </Router>
                      </StateProvider>
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
};

export default AppShell;
