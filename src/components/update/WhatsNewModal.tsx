'use client';

/**
 * What's New Modal Component
 *
 * One-time dismissible modal shown to returning users after the USCIS 2025
 * update. Highlights 3 key features: 128 questions, USCIS 2025 update,
 * and state personalization.
 *
 * Features:
 * - Shown once per user (localStorage flag)
 * - Only shown to returning users (not brand-new installs)
 * - 3 bilingual feature highlights
 * - Dismissible via close button or "Got it!" button
 * - Semantic design tokens (no dark: overrides needed)
 * - Uses Radix Dialog for focus trap and keyboard navigation
 */

import { useState, useCallback } from 'react';
import { Sparkles, BookOpen, ShieldCheck, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { useLanguage } from '@/contexts/LanguageContext';

const WHATS_NEW_KEY = 'civic-prep-whats-new-2025-seen';

interface WhatsNewModalProps {
  /** Called when user dismisses the modal */
  onClose: () => void;
}

/**
 * Hook to manage What's New modal display logic.
 *
 * Returns `showWhatsNew: true` only if:
 * 1. The localStorage key has NOT been set to 'true'
 * 2. The user has existing app data (any civic-prep-* key exists)
 *
 * @example
 * ```tsx
 * const { showWhatsNew, dismissWhatsNew } = useWhatsNew();
 * {showWhatsNew && <WhatsNewModal onClose={dismissWhatsNew} />}
 * ```
 */
export function useWhatsNew(): { showWhatsNew: boolean; dismissWhatsNew: () => void } {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;

    // Already seen? Don't show.
    const alreadySeen = localStorage.getItem(WHATS_NEW_KEY) === 'true';
    if (alreadySeen) return true;

    // Check if user is a returning user (has any civic-prep-* key in localStorage)
    const isReturningUser = Object.keys(localStorage).some(key => key.startsWith('civic-prep-'));

    // Brand-new users don't need What's New
    if (!isReturningUser) return true;

    // Returning user who hasn't seen it yet
    return false;
  });

  const dismissWhatsNew = useCallback(() => {
    localStorage.setItem(WHATS_NEW_KEY, 'true');
    setDismissed(true);
  }, []);

  return {
    showWhatsNew: !dismissed,
    dismissWhatsNew,
  };
}

const features = [
  {
    icon: BookOpen,
    titleEn: '128 Questions',
    titleMy: 'မေးခွန်း ၁၂၈ ခု',
    descEn: '8 new civics questions added to match the official USCIS 2025 test.',
    descMy: 'USCIS 2025 စာမေးပွဲနဲ့ ကိုက်ညီအောင် နိုင်ငံသားရေးရာ မေးခွန်း ၈ ခု ထပ်ထည့်ထားပါတယ်။',
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
  },
  {
    icon: ShieldCheck,
    titleEn: 'USCIS 2025 Updated',
    titleMy: 'USCIS 2025 မွမ်းမံပြီး',
    descEn: 'All questions verified against the latest USCIS 2025 civics test content.',
    descMy:
      'မေးခွန်းအားလုံးကို နောက်ဆုံး USCIS 2025 နိုင်ငံသားရေးရာ အကြောင်းအရာနဲ့ စစ်ဆေးပြီးပါပြီ။',
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success',
  },
  {
    icon: MapPin,
    titleEn: 'State Personalization',
    titleMy: 'ပြည်နယ်အလိုက် ပြင်ဆင်ခြင်း',
    descEn:
      'Select your state to see your governor, senators, and state capital in study questions.',
    descMy:
      'သင့်ပြည်နယ်ကို ရွေးချယ်ပြီး လေ့လာမေးခွန်းတွေမှာ သင့် ပြည်နယ်အုပ်ချုပ်ရေးမှူး (Governor)၊ အထက်လွှတ်တော်အမတ် (Senator) များနဲ့ ပြည်နယ်မြို့တော်ကို ကြည့်ပါ။',
    iconBg: 'bg-warning-subtle',
    iconColor: 'text-warning',
  },
] as const;

/**
 * One-time What's New modal for existing users after the USCIS 2025 update.
 *
 * @example
 * ```tsx
 * const { showWhatsNew, dismissWhatsNew } = useWhatsNew();
 * {showWhatsNew && <WhatsNewModal onClose={dismissWhatsNew} />}
 * ```
 */
export function WhatsNewModal({ onClose }: WhatsNewModalProps) {
  const { showBurmese } = useLanguage();

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent showCloseButton>
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <DialogTitle>What&apos;s New</DialogTitle>
            {showBurmese && (
              <p className="font-myanmar text-lg text-muted-foreground">ဘာအသစ်တွေရှိလဲ</p>
            )}
          </div>
        </div>

        <DialogDescription className="sr-only">
          New features and updates in this version
        </DialogDescription>

        {/* Feature cards */}
        <div className="mt-4 space-y-4">
          {features.map(feature => (
            <div key={feature.titleEn} className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${feature.iconBg}`}
              >
                <feature.icon className={`h-4 w-4 ${feature.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{feature.titleEn}</p>
                {showBurmese && (
                  <p className="font-myanmar font-medium text-muted-foreground">
                    {feature.titleMy}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-muted-foreground">{feature.descEn}</p>
                {showBurmese && (
                  <p className="font-myanmar mt-0.5 text-sm text-muted-foreground">
                    {feature.descMy}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
        >
          Got it!
          {showBurmese && <span className="font-myanmar ml-2 text-sm font-normal">ရပြီ!</span>}
        </button>
      </DialogContent>
    </Dialog>
  );
}
