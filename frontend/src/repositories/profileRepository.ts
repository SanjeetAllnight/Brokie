// Profile repository — manages the top-level users/{uid} document.
// Creates default fields if the document doesn't exist yet.

import { getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { userDocRef, safeWrite } from '../firebase/firestoreHelpers';

export interface FirestoreProfile {
  displayName: string;
  currency: string;
  createdAt: unknown; // Firestore ServerTimestamp on creation
}

const DEFAULT_PROFILE: Omit<FirestoreProfile, 'createdAt'> = {
  displayName: 'Brokie User',
  currency: 'USD',
};

/** Ensures the user document exists with at least default profile fields.
 *  Does NOT overwrite existing data. */
export async function ensureProfile(uid: string): Promise<void> {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await safeWrite('ensureProfile', () =>
      setDoc(ref, {
        ...DEFAULT_PROFILE,
        createdAt: serverTimestamp(),
      })
    );
  }
}

/** Writes profile fields to the user document. */
export async function writeProfile(
  uid: string,
  fields: Partial<{ currency: string; displayName: string }>
): Promise<void> {
  await safeWrite('writeProfile', () =>
    updateDoc(userDocRef(uid), fields as Record<string, unknown>)
  );
}

/** Subscribes to profile field changes on the user document. */
export function subscribeProfile(
  uid: string,
  onData: (profile: Partial<FirestoreProfile>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const profile: Partial<FirestoreProfile> = {};
      if (d.currency !== undefined)    profile.currency    = d.currency;
      if (d.displayName !== undefined) profile.displayName = d.displayName;
      onData(profile);
    },
    onError
  );
}
