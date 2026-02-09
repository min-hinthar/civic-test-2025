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
 * - pointer-events-none wrapper + pointer-events-auto content (MEMORY.md pattern)
 */

import { useState, useCallback } from 'react';
import { X, Sparkles, BookOpen, ShieldCheck, MapPin } from 'lucide-react';

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
    const isReturningUser = Object.keys(localStorage).some((key) =>
      key.startsWith('civic-prep-'),
    );

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
    descMy:
      'USCIS 2025 စာမေးပွဲနှင့် ကိုက်ညီရန် နိုင်ငံသားရေးရာမေးခွန်း ၈ ခု ထပ်ထည့်ထားသည်။',
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
  },
  {
    icon: ShieldCheck,
    titleEn: 'USCIS 2025 Updated',
    titleMy: 'USCIS 2025 မွမ်းမံပြီး',
    descEn: 'All questions verified against the latest USCIS 2025 civics test content.',
    descMy:
      'မေးခွန်းအားလုံးကို နောက်ဆုံး USCIS 2025 နိုင်ငံသားရေးရာ အကြောင်းအရာနှင့် စစ်ဆေးပြီးဖြစ်သည်။',
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success',
  },
  {
    icon: MapPin,
    titleEn: 'State Personalization',
    titleMy: 'ပြည်နယ်ပုဂ္ဂိုလ်ရေးသတ်မှတ်ခြင်း',
    descEn:
      'Select your state to see your governor, senators, and state capital in study questions.',
    descMy:
      'သင့်ပြည်နယ်ကို ရွေးချယ်ပြီး လေ့လာမေးခွန်းများတွင် သင့်အုပ်ချုပ်ရေးမှူး၊ အထက်လွှတ်တော်အမတ်များနှင့် ပြည်နယ်မြို့တော်ကို ကြည့်ပါ။',
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
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="pointer-events-auto absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal content */}
      <div className="pointer-events-auto relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">What&apos;s New</h2>
            <p className="font-myanmar text-sm text-muted-foreground">ဘာအသစ်တွေရှိလဲ</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mb-6 space-y-4">
          {features.map((feature) => (
            <div key={feature.titleEn} className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${feature.iconBg}`}
              >
                <feature.icon className={`h-4 w-4 ${feature.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{feature.titleEn}</p>
                <p className="font-myanmar text-sm font-medium text-foreground/80">
                  {feature.titleMy}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{feature.descEn}</p>
                <p className="font-myanmar mt-0.5 text-sm text-muted-foreground">
                  {feature.descMy}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90"
        >
          Got it! / <span className="font-myanmar">ရပြီ!</span>
        </button>
      </div>
    </div>
  );
}
