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
 * - Uses semantic design tokens (no dark: overrides needed)
 * - Respects language mode (showBurmese guard)
 */

import React, { useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { showBurmese } = useLanguage();
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
      <div className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
            <Download className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Bilingual title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          Install US Civics App
        </h2>
        {showBurmese && (
          <p className="mb-4 text-center font-myanmar text-lg text-muted-foreground">
            US Civics App ကို ထည့်သွင်းပါ
          </p>
        )}

        {/* Bilingual description */}
        <p className="mb-2 text-center text-sm text-muted-foreground">
          Study offline, anytime, anywhere.
        </p>
        {showBurmese && (
          <p className="mb-6 text-center font-myanmar text-sm text-muted-foreground">
            အင်တာနက်မရှိလည်း လေ့လာနိုင်ပါသည်။
          </p>
        )}

        {isIOS ? (
          showIOSInstructions ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                1. Tap the <Share className="inline h-4 w-4" aria-hidden="true" /> Share button
              </p>
              <p className="text-sm text-foreground">2. Select &quot;Add to Home Screen&quot;</p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  ၁။ Share ခလုတ်ကို နှိပ်ပါ
                </p>
              )}
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  ၂။ &quot;Add to Home Screen&quot; ကို ရွေးပါ
                </p>
              )}
              <button
                onClick={handleDismiss}
                className="mt-4 w-full rounded-lg bg-muted px-4 py-2 font-medium text-foreground hover:bg-muted/80"
              >
                {showBurmese ? 'Got it / နားလည်ပါပြီ' : 'Got it'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleIOSClick}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
            >
              {showBurmese ? 'Show me how / ပြသပါ' : 'Show me how'}
            </button>
          )
        ) : (
          <button
            onClick={handleInstall}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
          >
            {showBurmese ? 'Install Now / အခုထည့်သွင်းပါ' : 'Install Now'}
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {showBurmese ? 'Maybe later / နောက်မှ' : 'Maybe later'}
        </button>
      </div>
    </div>
  );
}
