'use client';

/**
 * Notification Settings Component
 *
 * Bilingual UI for configuring push notification study reminders.
 * Supports frequency selection: daily, every 2 days, weekly, or off.
 * Shows appropriate state for unsupported browsers or denied permissions.
 * Uses semantic design tokens (no dark: overrides needed).
 * Respects language mode (showBurmese guard).
 */

import React, { useSyncExternalStore } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { ReminderFrequency } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const FREQUENCY_OPTIONS: { value: ReminderFrequency; labelEn: string; labelMy: string }[] = [
  {
    value: 'daily',
    labelEn: 'Daily',
    labelMy: 'နေ့တိုင်း',
  },
  {
    value: 'every2days',
    labelEn: 'Every 2 days',
    labelMy: '၂ ရက်တစ်ကြိမ်',
  },
  { value: 'weekly', labelEn: 'Weekly', labelMy: 'အပတ်စဉ်' },
  {
    value: 'off',
    labelEn: 'Off',
    labelMy: 'ပိတ်ထားပါ',
  },
];

/**
 * Hook to detect if running on client side.
 * Uses useSyncExternalStore for proper hydration support.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function NotificationSettings() {
  const isClient = useIsClient();
  const { user } = useAuth();
  const { showBurmese } = useLanguage();
  const { isSubscribed, permission, reminderFrequency, isLoading, updateFrequency } =
    usePushNotifications(user?.id || null);

  const handleFrequencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frequency = e.target.value as ReminderFrequency;
    await updateFrequency(frequency);
  };

  // SSR-safe: don't render browser-dependent content on server
  if (!isClient) {
    return (
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Study Reminders</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If notifications not supported in this browser
  if (typeof Notification === 'undefined') {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Notifications are not supported in this browser.
        </p>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground">
            {'ဤဘရောင်ဇာတွင် အကြောင်းကြားချက်များကို မပံ့ပိုးပါ။'}
          </p>
        )}
      </div>
    );
  }

  // If user has blocked notifications in browser settings
  if (permission === 'denied') {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning-subtle p-4">
        <div className="flex items-center gap-2">
          <BellOff className="h-5 w-5 text-warning" />
          <p className="font-medium text-warning-800">Notifications blocked</p>
        </div>
        <p className="mt-1 text-sm text-warning-700">
          To enable notifications, update your browser settings.
        </p>
        {showBurmese && (
          <p className="font-myanmar text-sm text-warning-600">
            {'အကြောင်းကြားချက်များ ပိတ်ထားပါသည်။ ဘရောင်ဇာ ဆက်တင်မှ ပြင်ဆင်ပါ။'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-foreground">Study Reminders</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-1">Get friendly reminders to keep studying</p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mb-4">
          {'လေ့လာရန် သတိပေးချက်များ ရယူပါ'}
        </p>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="reminder-frequency" className="text-sm text-foreground">
          {showBurmese ? (
            <>
              Frequency / <span className="font-myanmar">{'ကြိမ်နှုန်း'}</span>:
            </>
          ) : (
            'Frequency:'
          )}
        </label>
        <select
          id="reminder-frequency"
          value={reminderFrequency}
          onChange={handleFrequencyChange}
          disabled={isLoading}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
        >
          {FREQUENCY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {showBurmese ? `${option.labelEn} / ${option.labelMy}` : option.labelEn}
            </option>
          ))}
        </select>
      </div>

      {isSubscribed && reminderFrequency !== 'off' && (
        <p className="mt-3 text-sm text-success-600">
          {showBurmese ? (
            <>
              Notifications enabled /{' '}
              <span className="font-myanmar">{'အကြောင်းကြားချက်များ ဖွင့်ထားပါပြီ'}</span>
            </>
          ) : (
            'Notifications enabled'
          )}
        </p>
      )}
    </div>
  );
}
