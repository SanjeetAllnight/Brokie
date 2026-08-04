// FCM repository — manages FCM token storage in Firestore.
// Tokens are stored in users/{uid}/fcmTokens/{tokenId} to support multiple devices.

import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseApp';

export interface FCMTokenDoc {
  token:     string;
  platform:  string;
  createdAt: unknown; // serverTimestamp
}

function fcmTokenDocRef(uid: string, tokenId: string) {
  return doc(db, 'users', uid, 'fcmTokens', tokenId);
}

/** Saves an FCM registration token for the current device. */
export async function saveFCMToken(uid: string, token: string): Promise<void> {
  // Use a hash of the token as the document ID to prevent duplicates
  const tokenId = btoa(token).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  const ref = fcmTokenDocRef(uid, tokenId);

  await setDoc(ref, {
    token,
    platform: getPlatform(),
    createdAt: serverTimestamp(),
  } satisfies Omit<FCMTokenDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> });
}

/** Removes a stale or invalid FCM token. */
export async function deleteFCMToken(uid: string, token: string): Promise<void> {
  const tokenId = btoa(token).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  await deleteDoc(fcmTokenDocRef(uid, tokenId));
}

function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua))           return 'android';
  return 'web';
}
