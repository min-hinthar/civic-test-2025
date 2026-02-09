'use client';

/**
 * Welcome Modal Component
 *
 * Post-install onboarding modal shown after PWA installation.
 * Displays bilingual tips about offline capability, auto-sync,
 * and home screen usage. Includes notification pre-prompt.
 *
 * Features:
 * - 3 bilingual tips (offline, sync, home screen)
 * - Notification permission pre-prompt (if not already decided)
 * - Only shown once per device (tracked via localStorage)
 * - Scrollable on small screens
 * - Semantic design tokens (no dark: overrides needed)
 */

import React, { useState } from 'react';
import { X, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { NotificationPrePrompt } from './NotificationPrePrompt';

interface WelcomeModalProps {
  /** Called when user closes the welcome modal */
  onClose: () => void;
}

/**
 * Post-install welcome modal with tips and notification opt-in.
 *
 * @example
 * ```tsx
 * {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
 * ```
 */
export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);
  const [notificationHandled, setNotificationHandled] = useState(false);

  const handleNotificationAccept = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('notifications-enabled', 'true');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    setNotificationHandled(true);
    setShowNotificationPrompt(false);
  };

  const handleNotificationDecline = () => {
    localStorage.setItem('notifications-declined', 'true');
    setNotificationHandled(true);
    setShowNotificationPrompt(false);
  };

  const handleClose = () => {
    localStorage.setItem('welcome-shown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Welcome header */}
        <h2 className="mb-1 text-2xl font-bold text-foreground">Welcome!</h2>
        <p className="font-myanmar mb-1 text-xl font-bold text-foreground">
          ကြိုဆိုပါတယ်!
        </p>
        <p className="mb-6 text-muted-foreground">
          Your app is ready. Here are some tips:
        </p>

        {/* Tips */}
        <div className="mb-6 space-y-4">
          {/* Offline tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-100">
              <WifiOff className="h-4 w-4 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">Works offline</p>
              <p className="text-sm text-muted-foreground">
                Study anytime, even without internet.
              </p>
              <p className="font-myanmar text-sm text-muted-foreground">
                အင်တာနက်မရှိလည်း လေ့လာနိုင်ပါသည်။
              </p>
            </div>
          </div>

          {/* Sync tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Auto-syncs your progress</p>
              <p className="text-sm text-muted-foreground">
                Your test results sync when you&apos;re back online.
              </p>
              <p className="font-myanmar text-sm text-muted-foreground">
                အင်တာနက်ပြန်ရတဲ့အခါ သင့်ရလဒ်များ အလိုအလျောက် စင့်ခ်လုပ်ပါမယ်။
              </p>
            </div>
          </div>

          {/* Home screen tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Smartphone className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">Open from home screen</p>
              <p className="text-sm text-muted-foreground">
                For the best experience, open the app from your home screen.
              </p>
              <p className="font-myanmar text-sm text-muted-foreground">
                အကောင်းဆုံး အတွေ့အကြုံအတွက် Home screen မှ ဖွင့်ပါ။
              </p>
            </div>
          </div>
        </div>

        {/* Notification pre-prompt - shown if browser supports and not yet decided */}
        {showNotificationPrompt &&
          !notificationHandled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'default' && (
            <div className="mb-6">
              <NotificationPrePrompt
                onAccept={handleNotificationAccept}
                onDecline={handleNotificationDecline}
              />
            </div>
          )}

        {/* Get started button */}
        <button
          onClick={handleClose}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
        >
          Get Started / စတင်ပါ
        </button>
      </div>
    </div>
  );
}
