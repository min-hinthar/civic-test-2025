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
 * - Respects language mode (showBurmese guard)
 * - Uses Radix Dialog for focus trap and keyboard navigation
 */

import { useState } from 'react';
import { WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { NotificationPrePrompt } from './NotificationPrePrompt';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { showBurmese } = useLanguage();
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
    <Dialog open onOpenChange={open => !open && handleClose()}>
      <DialogContent showCloseButton>
        {/* Welcome header */}
        <DialogTitle className="text-2xl">Welcome!</DialogTitle>
        {showBurmese && (
          <p className="font-myanmar text-2xl font-bold text-muted-foreground">ကြိုဆိုပါတယ်!</p>
        )}
        <DialogDescription>
          Your app is ready. Here are some tips:
          {showBurmese && (
            <span className="block font-myanmar mt-0.5">
              အက်ပ်အသင့်ဖြစ်ပါပြီ။ အကြံပြုချက်တချို့ကြည့်ပါ:
            </span>
          )}
        </DialogDescription>

        {/* Tips */}
        <div className="mt-4 space-y-4">
          {/* Offline tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-100">
              <WifiOff className="h-4 w-4 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Works offline
                {showBurmese && (
                  <span className="font-myanmar block font-normal text-muted-foreground">
                    အင်တာနက်မရှိလည်း အလုပ်လုပ်ပါတယ်
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">Study anytime, even without internet.</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  အင်တာနက်မရှိလည်း အချိန်မရွေး လေ့လာနိုင်ပါတယ်။
                </p>
              )}
            </div>
          </div>

          {/* Sync tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Auto-syncs your progress
                {showBurmese && (
                  <span className="font-myanmar block font-normal text-muted-foreground">
                    တိုးတက်မှုကို အလိုအလျောက် ချိန်ကိုက်ပေးပါတယ်
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Your test results sync when you&apos;re back online.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  အင်တာနက်ပြန်ရတဲ့အခါ သင့်ရလဒ်များ အလိုအလျောက် ချိန်ကိုက်ပေးပါမယ်။
                </p>
              )}
            </div>
          </div>

          {/* Home screen tip */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Smartphone className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Open from home screen
                {showBurmese && (
                  <span className="font-myanmar block font-normal text-muted-foreground">
                    Home screen ကနေ ဖွင့်ပါ
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                For the best experience, open the app from your home screen.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  အကောင်းဆုံးအတွေ့အကြုံအတွက် Home screen ကနေ ဖွင့်ပါ။
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notification pre-prompt - shown if browser supports and not yet decided */}
        {showNotificationPrompt &&
          !notificationHandled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'default' && (
            <div className="mt-4">
              <NotificationPrePrompt
                onAccept={handleNotificationAccept}
                onDecline={handleNotificationDecline}
              />
            </div>
          )}

        {/* Get started button */}
        <button
          onClick={handleClose}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
        >
          Get Started
          {showBurmese && <span className="font-myanmar ml-2 text-sm font-normal">စတင်ပါ</span>}
        </button>
      </DialogContent>
    </Dialog>
  );
}
