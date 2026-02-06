'use client';

import { useSyncExternalStore } from 'react';
import Head from 'next/head';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/BilingualToast';
import { useViewportHeight } from '@/lib/useViewportHeight';
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

const AppShell = () => {
  const isClient = useIsClient();

  useViewportHeight();

  if (!isClient) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Head>
                <title>Civic Test Prep - Master Your U.S. Citizenship Test</title>
                <meta
                  name="description"
                  content="Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking."
                />
              </Head>
              <ErrorBoundary>
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
              <Toaster />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppShell;
