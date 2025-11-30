'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
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

const AppShell = () => {
  const [isClient, setIsClient] = useState(false);

  useViewportHeight();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Head>
            <title>Civic Test Prep - Master Your U.S. Citizenship Test</title>
            <meta
              name="description"
              content="Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking."
            />
          </Head>
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
            <Toaster />
          </Router>
        </AuthProvider>
    </ThemeProvider>
  );
};

export default AppShell;
