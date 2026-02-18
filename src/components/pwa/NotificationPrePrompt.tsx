'use client';

/**
 * Notification Pre-Prompt Component
 *
 * Bilingual explanation card shown before triggering the native
 * Notification.requestPermission() dialog. Explains the value
 * of notifications (study reminders) so users make an informed choice.
 *
 * This "pre-prompt" pattern increases acceptance rates by giving
 * context before the browser's one-shot permission dialog.
 *
 * Uses semantic design tokens (no dark: overrides needed).
 * Respects language mode (showBurmese guard).
 */

import React from 'react';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationPrePromptProps {
  /** Called when user accepts - triggers native permission request */
  onAccept: () => void;
  /** Called when user declines notifications */
  onDecline: () => void;
}

/**
 * Friendly bilingual card explaining notification value.
 *
 * @example
 * ```tsx
 * <NotificationPrePrompt
 *   onAccept={handleNotificationAccept}
 *   onDecline={handleNotificationDecline}
 * />
 * ```
 */
export function NotificationPrePrompt({ onAccept, onDecline }: NotificationPrePromptProps) {
  const { showBurmese } = useLanguage();

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">Get study reminders?</h3>
          {showBurmese && (
            <p className="font-myanmar text-sm text-muted-foreground">
              လေ့လာရန် သတိပေးချက် လိုချင်ပါသလား။
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll send friendly reminders to help you stay on track.
          </p>
          {showBurmese && (
            <p className="font-myanmar text-sm text-muted-foreground">
              လေ့လာမှု ပုံမှန်ဖြစ်အောင် သတိပေးပေးပါမယ်။
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onAccept}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              Yes, remind me
              {showBurmese && (
                <span className="font-myanmar ml-1 text-xs font-normal">ဟုတ်ကဲ့</span>
              )}
            </button>
            <button
              onClick={onDecline}
              className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              No thanks
              {showBurmese && <span className="font-myanmar ml-1 text-xs font-normal">မလိုပါ</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
