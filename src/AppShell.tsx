'use client';

import { useState, useSyncExternalStore } from 'react';
import Head from 'next/head';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SRSProvider } from '@/contexts/SRSContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/BilingualToast';
import { PageTransition } from '@/components/animations/PageTransition';
import { useViewportHeight } from '@/lib/useViewportHeight';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { WelcomeModal } from '@/components/pwa/WelcomeModal';
import { IOSTip, shouldShowIOSTip } from '@/components/pwa/IOSTip';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import TestPage from '@/pages/TestPage';
import StudyGuidePage from '@/pages/StudyGuidePage';
import HistoryPage from '@/pages/HistoryPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import PasswordResetPage from '@/pages/PasswordResetPage';
import PasswordUpdatePage from '@/pages/PasswordUpdatePage';
import OpEdPage from '@/pages/OpEdPage';
import SettingsPage from '@/pages/SettingsPage';
import ProgressPage from '@/pages/ProgressPage';
import PracticePage from '@/pages/PracticePage';
import InterviewPage from '@/pages/InterviewPage';
import SocialHubPage from '@/pages/SocialHubPage';

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

const AppShell = () => {
  const isClient = useIsClient();

  useViewportHeight();

  if (!isClient) {
    return null;
  }

  return (
    <ErrorBoundary>
      <OfflineProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <SocialProvider>
                <SRSProvider>
                <Router>
                  <Head>
                    <title>Civic Test Prep - Master Your U.S. Citizenship Test</title>
                    <meta
                      name="description"
                      content="Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking."
                    />
                  </Head>
                  <ErrorBoundary>
                    <PageTransition>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/auth/forgot" element={<PasswordResetPage />} />
                        <Route path="/auth/update-password" element={<PasswordUpdatePage />} />
                        <Route path="/op-ed" element={<OpEdPage />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
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
                          path="/history"
                          element={
                            <ProtectedRoute>
                              <HistoryPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/progress"
                          element={
                            <ProtectedRoute>
                              <ProgressPage />
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
                        <Route path="/social" element={<SocialHubPage />} />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <SettingsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </PageTransition>
                  </ErrorBoundary>
                  <PWAOnboardingFlow />
                </Router>
                </SRSProvider>
                </SocialProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </OfflineProvider>
    </ErrorBoundary>
  );
};

export default AppShell;
