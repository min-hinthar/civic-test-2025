'use client';

/**
 * iOS Safari Data Persistence Tip
 *
 * Friendly one-time tip for iOS Safari users about the 7-day data
 * eviction policy. Uses warm amber styling with a lightbulb icon
 * to keep the tone helpful rather than alarming.
 *
 * Features:
 * - Only appears on iOS Safari (not Chromium, not standalone PWA)
 * - Dismissal tracked in localStorage (shows once per device)
 * - Bilingual: English + Burmese
 * - Warm amber color scheme with lightbulb icon
 * - Bottom banner positioning (non-blocking)
 * - Semantic design tokens (no dark: overrides needed)
 */

import React from 'react';
import { X, Lightbulb } from 'lucide-react';

const IOS_TIP_SHOWN_KEY = 'ios-tip-shown';

interface IOSTipProps {
  onDismiss: () => void;
}

/**
 * Warm, friendly iOS tip component.
 *
 * Advises iOS Safari users to open the app weekly to preserve
 * their study progress, and suggests adding to home screen.
 *
 * @example
 * ```tsx
 * {showIOSTip && (
 *   <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
 *     <IOSTip onDismiss={() => setShowIOSTip(false)} />
 *   </div>
 * )}
 * ```
 */
export function IOSTip({ onDismiss }: IOSTipProps) {
  const handleDismiss = () => {
    localStorage.setItem(IOS_TIP_SHOWN_KEY, 'true');
    onDismiss();
  };

  return (
    <div className="relative rounded-lg border border-warning/40 bg-warning-subtle p-4 shadow-lg">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 p-1 text-warning-600 hover:text-warning-800"
        aria-label="Dismiss tip"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-warning-100">
          <Lightbulb className="h-4 w-4 text-warning-600" />
        </div>
        <div>
          {/* Friendly tip - not a warning */}
          <p className="text-sm font-medium text-warning-800">Quick tip for the best experience</p>
          <p className="font-myanmar text-sm text-warning-700">
            အကောင်းဆုံး အတွေ့အကြုံအတွက် အကြံပြုချက်
          </p>

          <p className="mt-2 text-sm text-warning-700">
            Open the app at least once a week to keep your study progress saved. Better yet, add it
            to your home screen for the fullest experience!
          </p>
          <p className="mt-1 font-myanmar text-sm text-warning-600">
            သင့်လေ့လာမှု တိုးတက်မှုကို သိမ်းဆည်းထားဖို့ တစ်ပတ်လျှင် အနည်းဆုံး တစ်ကြိမ် အက်ပ်ကို
            ဖွင့်ပါ။ Home screen မှာ ထည့်ရင် ပိုကောင်းပါတယ်!
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Determine whether the iOS tip should be shown.
 *
 * Returns true only when ALL conditions are met:
 * 1. Running in the browser (not SSR)
 * 2. Device is iOS (iPad, iPhone, or iPod)
 * 3. App is NOT running in standalone/PWA mode
 * 4. User has NOT previously dismissed the tip
 */
export function shouldShowIOSTip(): boolean {
  if (typeof window === 'undefined') return false;

  // Only show on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS) return false;

  // Don't show if already installed as PWA (standalone mode)
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  if ((navigator as unknown as { standalone?: boolean }).standalone) return false;

  // Don't show if already dismissed
  if (localStorage.getItem(IOS_TIP_SHOWN_KEY)) return false;

  return true;
}
