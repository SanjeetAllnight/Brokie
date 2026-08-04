// Resistance repository — manages users/{uid}/resistedTemptations subcollection.

import {
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import {
  temptationsColRef,
  temptationDocRef,
  temptationConverter,
  safeWrite,
} from '../firebase/firestoreHelpers';
import type { ResistedTemptation } from '../types/resistance';

/** Writes a new resisted temptation document to Firestore. */
export async function addTemptation(
  uid: string,
  temptation: ResistedTemptation
): Promise<void> {
  await safeWrite('addTemptation', () =>
    setDoc(
      temptationDocRef(uid, temptation.id).withConverter(temptationConverter),
      temptation
    )
  );
}

/** Subscribes to the most recent 100 resisted temptations (newest first).
 *  Returns an unsubscribe function. */
export function subscribeTemptations(
  uid: string,
  onData: (temptations: ResistedTemptation[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    temptationsColRef(uid).withConverter(temptationConverter),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snap) => {
      const temptations = snap.docs.map((d) => d.data());
      onData(temptations);
    },
    onError
  );
}
