'use client';

/**
 * Install Prompt Component
 *
 * Bilingual (English + Burmese) modal prompting users to install the PWA.
 * Shown immediately on first visit per user decision.
 *
 * Features:
 * - Chromium: Uses beforeinstallprompt for native install
 * - iOS: Shows manual "Add to Home Screen" instructions
 * - 7-day cooldown after dismissal
 * - Bilingual text throughout (English + Burmese)
 * - Uses primary theme color #002868
 */

import React, { useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface InstallPromptProps {
  /** Called when the user successfully installs the app */
  onInstalled?: () => void;
}

/**
 * Modal overlay prompting the user to install the PWA.
 *
 * On Chromium browsers, triggers the native install dialog.
 * On iOS, displays step-by-step instructions for Add to Home Screen.
 *
 * @example
 * ```tsx
 * {showInstall && <InstallPrompt onInstalled={handleInstalled} />}
 * ```
 */
export function InstallPrompt({ onInstalled }: InstallPromptProps) {
  const { canInstall, isInstalled, isIOS, promptInstall, dismissPrompt } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't render if already installed
  if (isInstalled) return null;

  // Show on first visit: either canInstall (Chromium) or iOS first visit
  const shouldShow = canInstall || (isIOS && !localStorage.getItem('ios-install-shown'));

  if (!shouldShow && !showIOSInstructions) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      onInstalled?.();
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    if (isIOS) {
      localStorage.setItem('ios-install-shown', 'true');
    }
  };

  const handleIOSClick = () => {
    setShowIOSInstructions(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Bilingual title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
          Install US Civics App
        </h2>
        <p className="mb-4 text-center font-myanmar text-lg text-gray-600 dark:text-gray-300">
          US Civics App ကို ထည့်သွင်းပါ
        </p>

        {/* Bilingual description */}
        <p className="mb-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Study offline, anytime, anywhere.
        </p>
        <p className="mb-6 text-center font-myanmar text-sm text-gray-600 dark:text-gray-400">
          အင်တာနက်မရှိလည်း လေ့လာနိုင်ပါသည်။
        </p>

        {isIOS ? (
          showIOSInstructions ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                1. Tap the <Share className="inline h-4 w-4" aria-hidden="true" /> Share button
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                2. Select &quot;Add to Home Screen&quot;
              </p>
              <p className="font-myanmar text-sm text-gray-600 dark:text-gray-400">
                ၁။ Share ခလုတ်ကို နှိပ်ပါ
              </p>
              <p className="font-myanmar text-sm text-gray-600 dark:text-gray-400">
                ၂။ &quot;Add to Home Screen&quot; ကို ရွေးပါ
              </p>
              <button
                onClick={handleDismiss}
                className="mt-4 w-full rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Got it / နားလည်ပါပြီ
              </button>
            </div>
          ) : (
            <button
              onClick={handleIOSClick}
              className="w-full rounded-lg bg-[#002868] px-4 py-3 font-medium text-white hover:bg-blue-800"
            >
              Show me how / ပြသပါ
            </button>
          )
        ) : (
          <button
            onClick={handleInstall}
            className="w-full rounded-lg bg-[#002868] px-4 py-3 font-medium text-white hover:bg-blue-800"
          >
            Install Now / အခုထည့်သွင်းပါ
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Maybe later / နောက်မှ
        </button>
      </div>
    </div>
  );
}
