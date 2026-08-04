// usePushNotifications — React hook that manages FCM token registration lifecycle.
// Wires notification permission state to the Settings store.

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  isNotificationSupported,
  incrementLaunchCount,
  shouldRequestPermission,
  requestPermissionAndRegister,
  registerFCMToken,
  configureMessagingServiceWorker,
} from './notificationService';

const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
};

export type PermissionStatus = NotificationPermission | 'unsupported' | 'idle';

interface UsePushNotificationsReturn {
  permissionStatus:   PermissionStatus;
  isSupported:        boolean;
  requestPermission:  () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const uid                  = useAuthStore((s) => s.uid);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(() => {
    if (!isNotificationSupported()) return 'unsupported';
    return (Notification.permission as NotificationPermission) ?? 'default';
  });

  const isSupported = isNotificationSupported();

  // ─── On mount: increment launch counter, configure SW, auto-prompt if eligible ──
  useEffect(() => {
    incrementLaunchCount();

    // Send Firebase config to the FCM service worker
    configureMessagingServiceWorker(FIREBASE_CONFIG).catch(console.error);

    // Auto-prompt after 3+ launches if eligible and user has enabled notifications
    if (uid && notificationsEnabled && shouldRequestPermission()) {
      requestPermissionAndRegister(uid)
        .then(setPermissionStatus)
        .catch(console.error);
    }

    // If permission was already granted, silently re-register the token
    if (uid && isSupported && Notification.permission === 'granted') {
      registerFCMToken(uid).catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // ─── Re-register when notifications are enabled in Settings ──────────────────
  useEffect(() => {
    if (!uid || !notificationsEnabled || !isSupported) return;
    if (Notification.permission === 'granted') {
      registerFCMToken(uid).catch(console.error);
    }
  }, [uid, notificationsEnabled, isSupported]);

  // ─── Explicit permission request (triggered from Settings toggle) ─────────────
  const requestPermission = useCallback(async () => {
    if (!uid || !isSupported) return;
    const status = await requestPermissionAndRegister(uid);
    setPermissionStatus(status);
  }, [uid, isSupported]);

  return { permissionStatus, isSupported, requestPermission };
}
