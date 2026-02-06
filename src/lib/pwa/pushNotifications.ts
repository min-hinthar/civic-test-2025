/**
 * Push Notification Client Logic
 *
 * Handles subscribing/unsubscribing to push notifications via the
 * Push API and communicating subscription data to the server.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type ReminderFrequency = 'daily' | 'every2days' | 'weekly' | 'off';

export async function subscribeToPush(
  userId: string,
  reminderFrequency: ReminderFrequency
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VAPID public key not configured');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
        reminderFrequency,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Push subscription error:', error);
    return false;
  }
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Notify server to remove subscription
    const response = await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return false;
  }
}

export async function getSubscriptionStatus(): Promise<{
  subscribed: boolean;
  permission: NotificationPermission;
}> {
  if (typeof Notification === 'undefined') {
    return { subscribed: false, permission: 'denied' };
  }

  const permission = Notification.permission;

  if (permission !== 'granted') {
    return { subscribed: false, permission };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return { subscribed: !!subscription, permission };
  } catch {
    return { subscribed: false, permission };
  }
}
