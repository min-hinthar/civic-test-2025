'use client';

import { useState } from 'react';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { WhatsNewModal, useWhatsNew } from '@/components/update/WhatsNewModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Greeting flow: Welcome -> What's New -> (then tour runs independently).
 *
 * - Welcome shows on every sign-in (detects user transition from null -> non-null).
 * - After welcome is dismissed, What's New shows if eligible (one-time, localStorage).
 * - The onboarding tour runs after both are done (it gates on localStorage independently).
 */
export function GreetingFlow() {
  const { user } = useAuth();
  const { showWhatsNew, dismissWhatsNew } = useWhatsNew();

  // Track user transitions to detect sign-in events
  // (React-approved "adjust state when props change" pattern -- no effects needed)
  const [prevUserId, setPrevUserId] = useState<string | null>(user?.id ?? null);
  const [showWelcome, setShowWelcome] = useState(!!user);

  const currentUserId = user?.id ?? null;
  if (currentUserId !== prevUserId) {
    setPrevUserId(currentUserId);
    // User signed in -> show welcome; signed out -> reset
    setShowWelcome(!!currentUserId);
  }

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  // Welcome screen gates What's New -- early return ensures sequencing
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
