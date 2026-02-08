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
 */

import React from 'react';
import { Bell } from 'lucide-react';

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
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">Get study reminders?</h3>
          <p className="font-myanmar text-sm text-gray-600 dark:text-gray-400">
            လေ့လာရန် သတိပေးချက် လိုချင်ပါသလား။
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            We&apos;ll send friendly reminders to help you stay on track.
          </p>
          <p className="font-myanmar text-sm text-gray-500 dark:text-gray-500">
            လေ့လာမှု ပုံမှန်ဖြစ်အောင် သတိပေးပေးပါမယ်။
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onAccept}
              className="rounded-md bg-[#002868] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
            >
              Yes, remind me / ဟုတ်ကဲ့
            </button>
            <button
              onClick={onDecline}
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              No thanks / မလိုပါ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
