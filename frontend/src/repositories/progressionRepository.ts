import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/firebaseApp';
import { safeWrite } from '../firebase/firestoreHelpers';
import type { ProgressionState } from '../progression/types';
import { getTodayDateString } from '../progression/questService';

export function progressionDocRef(uid: string) {
  return doc(db, 'users', uid, 'progression', 'state');
}

const DEFAULT_PROGRESSION: ProgressionState = {
  xp: 0,
  streaks: {},
  quests: {
    date: getTodayDateString(),
    completedIds: [],
  },
  achievements: [],
};

/** Ensures the progression document exists */
export async function ensureProgression(uid: string): Promise<void> {
  const ref = progressionDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await safeWrite('ensureProgression', () => setDoc(ref, DEFAULT_PROGRESSION));
  }
}

/** Updates progression fields */
export async function writeProgression(
  uid: string,
  fields: Partial<ProgressionState>
): Promise<void> {
  await safeWrite('writeProgression', () =>
    updateDoc(progressionDocRef(uid), fields as Record<string, unknown>)
  );
}

/** Subscribes to progression state */
export function subscribeProgression(
  uid: string,
  onData: (state: ProgressionState) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    progressionDocRef(uid),
    (snap) => {
      if (!snap.exists()) return;
      onData(snap.data() as ProgressionState);
    },
    onError
  );
}
