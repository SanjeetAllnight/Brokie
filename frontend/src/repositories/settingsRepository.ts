// Settings repository — reads and writes settings fields on users/{uid}.
// Stored as fields on the user document (same document as wallet).

import { updateDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { userDocRef, safeWrite } from '../firebase/firestoreHelpers';

export interface FirestoreSettingsFields {
  roastIntensity: 'gentle' | 'sarcastic' | 'unhinged';
  notificationsEnabled: boolean;
  notificationTime: string;    // "HH:MM" format
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_SETTINGS: FirestoreSettingsFields = {
  roastIntensity: 'sarcastic',
  notificationsEnabled: false,
  notificationTime: '09:00',
  theme: 'system',
};

/** Writes one or more settings fields to the user document. */
export async function writeSettings(
  uid: string,
  fields: Partial<FirestoreSettingsFields>
): Promise<void> {
  await safeWrite('writeSettings', () =>
    updateDoc(userDocRef(uid), fields as Record<string, unknown>)
  );
}

/** Subscribes to settings field changes on the user document.
 *  Returns an unsubscribe function. */
export function subscribeSettings(
  uid: string,
  onData: (settings: Partial<FirestoreSettingsFields>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const settings: Partial<FirestoreSettingsFields> = {};
      if (d.roastIntensity !== undefined)        settings.roastIntensity        = d.roastIntensity;
      if (d.notificationsEnabled !== undefined)  settings.notificationsEnabled  = d.notificationsEnabled;
      if (d.notificationTime !== undefined)      settings.notificationTime      = d.notificationTime;
      if (d.theme !== undefined)                 settings.theme                 = d.theme;
      onData(settings);
    },
    onError
  );
}
