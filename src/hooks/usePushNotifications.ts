import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getSubscriptionStatus,
} from '@/lib/pwa/pushNotifications';
import type { ReminderFrequency } from '@/lib/pwa/pushNotifications';
import { supabase } from '@/lib/supabaseClient';

export type { ReminderFrequency };

interface UsePushNotificationsResult {
  isSubscribed: boolean;
  permission: NotificationPermission;
  reminderFrequency: ReminderFrequency;
  isLoading: boolean;
  subscribe: (frequency: ReminderFrequency) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updateFrequency: (frequency: ReminderFrequency) => Promise<boolean>;
}

const FREQUENCY_KEY = 'push-reminder-frequency';

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) {
    console.warn('No active session - cannot authenticate push request');
    return null;
  }
  return data.session.access_token;
}

export function usePushNotifications(userId: string | null): UsePushNotificationsResult {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('off');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const status = await getSubscriptionStatus();
      setIsSubscribed(status.subscribed);
      setPermission(status.permission);

      const savedFrequency = localStorage.getItem(FREQUENCY_KEY) as ReminderFrequency | null;
      if (savedFrequency) {
        setReminderFrequency(savedFrequency);
      }

      setIsLoading(false);
    }
    checkStatus();
  }, []);

  const subscribe = useCallback(
    async (frequency: ReminderFrequency): Promise<boolean> => {
      if (!userId) return false;

      const accessToken = await getAccessToken();
      if (!accessToken) return false;

      setIsLoading(true);
      const success = await subscribeToPush(accessToken, frequency);
      if (success) {
        setIsSubscribed(true);
        setReminderFrequency(frequency);
        localStorage.setItem(FREQUENCY_KEY, frequency);
      }
      setIsLoading(false);
      return success;
    },
    [userId]
  );

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    const accessToken = await getAccessToken();
    if (!accessToken) return false;

    setIsLoading(true);
    const success = await unsubscribeFromPush(accessToken);
    if (success) {
      setIsSubscribed(false);
      setReminderFrequency('off');
      localStorage.setItem(FREQUENCY_KEY, 'off');
    }
    setIsLoading(false);
    return success;
  }, [userId]);

  const updateFrequency = useCallback(
    async (frequency: ReminderFrequency): Promise<boolean> => {
      if (!userId) return false;

      if (frequency === 'off') {
        return unsubscribe();
      }

      const accessToken = await getAccessToken();
      if (!accessToken) return false;

      setIsLoading(true);
      const success = await subscribeToPush(accessToken, frequency);
      if (success) {
        setReminderFrequency(frequency);
        localStorage.setItem(FREQUENCY_KEY, frequency);
      }
      setIsLoading(false);
      return success;
    },
    [userId, unsubscribe]
  );

  return {
    isSubscribed,
    permission,
    reminderFrequency,
    isLoading,
    subscribe,
    unsubscribe,
    updateFrequency,
  };
}
