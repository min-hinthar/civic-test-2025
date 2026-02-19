'use client';

import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandscapeOverlayProps {
  /** Whether the overlay should show (interview is in progress) */
  active: boolean;
}

/**
 * Full-screen overlay prompting the user to rotate their device to portrait.
 *
 * Fallback for browsers that don't support `screen.orientation.lock()` (Safari).
 * Uses CSS `landscape:` media query so the overlay is visible only in landscape
 * orientation and hidden in portrait. Only renders when `active` is true to
 * prevent showing on non-interview pages.
 *
 * Includes bilingual text (English + Burmese) when Burmese mode is active.
 */
export function LandscapeOverlay({ active }: LandscapeOverlayProps) {
  const { showBurmese } = useLanguage();

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/95 landscape:flex portrait:hidden">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <RotateCcw className="h-16 w-16 text-primary" />

        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold text-white">Please rotate your device to portrait</p>
          {showBurmese && (
            <p className="font-myanmar text-lg text-slate-300">သင့်ဖုန်းကို ဒေါင်လိုက်လှည့်ပါ</p>
          )}
        </div>
      </div>
    </div>
  );
}
