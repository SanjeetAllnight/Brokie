// Notification service — manages FCM token lifecycle and permission requests.
// Separated from React to keep notification logic testable and reusable.

import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { saveFCMToken, deleteFCMToken } from '../repositories/fcmRepository';

const LAUNCH_COUNT_KEY = 'brokie_launch_count';
const PERMISSION_ASKED_KEY = 'brokie_permission_asked';
const PERMISSION_THRESHOLD = 3; // Ask after N launches

// ─── Launch counter ───────────────────────────────────────────────────────────

export function incrementLaunchCount(): void {
  const current = getLaunchCount();
  localStorage.setItem(LAUNCH_COUNT_KEY, String(current + 1));
}

export function getLaunchCount(): number {
  return parseInt(localStorage.getItem(LAUNCH_COUNT_KEY) ?? '0', 10);
}

// ─── Permission gating ────────────────────────────────────────────────────────

/** Returns true if the app should show a permission prompt to the user. */
export function shouldRequestPermission(): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === 'granted') return false;
  if (Notification.permission === 'denied') return false;
  if (localStorage.getItem(PERMISSION_ASKED_KEY) === 'true') return false;
  return getLaunchCount() >= PERMISSION_THRESHOLD;
}

export function markPermissionAsked(): void {
  localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
}

// ─── Supported check ─────────────────────────────────────────────────────────

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// ─── Token registration ───────────────────────────────────────────────────────

/**
 * Requests notification permission (if not already granted),
 * retrieves the FCM token, and saves it to Firestore.
 * Returns the resulting permission status.
 */
export async function requestPermissionAndRegister(uid: string): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    markPermissionAsked();

    if (permission !== 'granted') return permission;

    await registerFCMToken(uid);
    return 'granted';
  } catch (err) {
    console.error('[Notifications] Permission request failed:', err);
    return 'denied';
  }
}

/** Registers the FCM token for this device if permission is already granted. */
export async function registerFCMToken(uid: string): Promise<string | null> {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  if (!vapidKey) {
    console.warn('[Notifications] VITE_FIREBASE_VAPID_KEY is not set. Push tokens will not be registered.');
    return null;
  }

  try {
    const messaging = getMessaging();
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

    if (token) {
      await saveFCMToken(uid, token);
      return token;
    }
    return null;
  } catch (err) {
    console.error('[Notifications] Token registration failed:', err);
    return null;
  }
}

/** Removes the FCM token for this device (on sign-out or opt-out). */
export async function unregisterFCMToken(uid: string): Promise<void> {
  if (!isNotificationSupported()) return;

  try {
    const messaging = getMessaging();
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    if (!vapidKey) return;

    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (token) {
      await deleteToken(messaging);
      await deleteFCMToken(uid, token);
    }
  } catch (err) {
    console.error('[Notifications] Token removal failed:', err);
  }
}

/** Send the Firebase config to the SW so it can initialize FCM. */
export async function configureMessagingServiceWorker(config: Record<string, string>): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'FIREBASE_CONFIG', config });
  } catch (err) {
    console.error('[Notifications] SW config message failed:', err);
  }
}
