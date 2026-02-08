'use client';

/**
 * Notification Settings Component
 *
 * Bilingual UI for configuring push notification study reminders.
 * Supports frequency selection: daily, every 2 days, weekly, or off.
 * Shows appropriate state for unsupported browsers or denied permissions.
 */

import React, { useSyncExternalStore } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { ReminderFrequency } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const FREQUENCY_OPTIONS: { value: ReminderFrequency; labelEn: string; labelMy: string }[] = [
  {
    value: 'daily',
    labelEn: 'Daily',
    labelMy: '\u1014\u1031\u1037\u1010\u102D\u102F\u1004\u103A\u1038',
  },
  {
    value: 'every2days',
    labelEn: 'Every 2 days',
    labelMy: '\u1042 \u101B\u1000\u103A\u1010\u1005\u103A\u1000\u103C\u102D\u1019\u103A',
  },
  { value: 'weekly', labelEn: 'Weekly', labelMy: '\u1021\u1015\u1010\u103A\u1005\u1009\u103A' },
  {
    value: 'off',
    labelEn: 'Off',
    labelMy: '\u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u102B',
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
  const { isSubscribed, permission, reminderFrequency, isLoading, updateFrequency } =
    usePushNotifications(user?.id || null);

  const handleFrequencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frequency = e.target.value as ReminderFrequency;
    await updateFrequency(frequency);
  };

  // SSR-safe: don't render browser-dependent content on server
  if (!isClient) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Study Reminders</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // If notifications not supported in this browser
  if (typeof Notification === 'undefined') {
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notifications are not supported in this browser.
        </p>
        <p className="font-myanmar text-sm text-gray-500 dark:text-gray-400">
          {
            '\u1024\u1018\u101B\u1031\u102C\u1004\u103A\u1007\u102C\u1010\u103D\u1004\u103A \u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1019\u1015\u1036\u1037\u1015\u102D\u102F\u1038\u1015\u102B\u104B'
          }
        </p>
      </div>
    );
  }

  // If user has blocked notifications in browser settings
  if (permission === 'denied') {
    return (
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
        <div className="flex items-center gap-2">
          <BellOff className="h-5 w-5 text-warning-500" />
          <p className="font-medium text-warning-800 dark:text-warning-200">
            Notifications blocked
          </p>
        </div>
        <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
          To enable notifications, update your browser settings.
        </p>
        <p className="font-myanmar text-sm text-warning-600 dark:text-warning-400">
          {
            '\u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u1015\u102D\u1010\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B \u1018\u101B\u1031\u102C\u1004\u103A\u1007\u102C \u1006\u1000\u103A\u1010\u1004\u103A\u1019\u103E \u1015\u103C\u1004\u103A\u1006\u1004\u103A\u1015\u102B\u104B'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Study Reminders</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Get friendly reminders to keep studying
      </p>
      <p className="font-myanmar text-sm text-gray-500 dark:text-gray-500 mb-4">
        {
          '\u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u101E\u1010\u102D\u1015\u1031\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u101B\u101A\u1030\u1015\u102B'
        }
      </p>

      <div className="flex items-center gap-3">
        <label htmlFor="reminder-frequency" className="text-sm text-gray-700 dark:text-gray-300">
          Frequency /{' '}
          <span className="font-myanmar">
            {'\u1000\u103C\u102D\u1019\u103A\u1014\u103E\u102F\u1014\u103A\u1038'}
          </span>
          :
        </label>
        <select
          id="reminder-frequency"
          value={reminderFrequency}
          onChange={handleFrequencyChange}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50"
        >
          {FREQUENCY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.labelEn} / {option.labelMy}
            </option>
          ))}
        </select>
      </div>

      {isSubscribed && reminderFrequency !== 'off' && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          Notifications enabled /{' '}
          <span className="font-myanmar">
            {
              '\u1021\u1000\u103C\u1031\u102C\u1004\u103A\u1038\u1000\u103C\u102C\u1038\u1001\u103B\u1000\u103A\u1019\u103B\u102C\u1038 \u1016\u103D\u1004\u1037\u103A\u1011\u102C\u1038\u1015\u102B\u1015\u103C\u102E'
            }
          </span>
        </p>
      )}
    </div>
  );
}
