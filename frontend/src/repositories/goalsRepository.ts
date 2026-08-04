import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseApp';
import type { SavingsGoal, GoalContribution } from '../types/goals';

// ─── Collections ─────────────────────────────────────────────────────────────

function goalsRef(uid: string) {
  return collection(db, 'users', uid, 'goals');
}

function goalDocRef(uid: string, goalId: string) {
  return doc(db, 'users', uid, 'goals', goalId);
}

function contributionsRef(uid: string) {
  return collection(db, 'users', uid, 'goalContributions');
}

function contributionDocRef(uid: string, contributionId: string) {
  return doc(db, 'users', uid, 'goalContributions', contributionId);
}

// ─── Reads (Hydration via getDocs, not real-time to save reads if wanted, but real-time is consistent with the rest) ────────────────

import { onSnapshot, query, orderBy } from 'firebase/firestore';

export function subscribeGoals(
  uid: string,
  onData: (goals: SavingsGoal[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(goalsRef(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const goals = snap.docs.map((d) => d.data() as SavingsGoal);
      onData(goals);
    },
    onError
  );
}

export function subscribeContributions(
  uid: string,
  onData: (contributions: GoalContribution[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(contributionsRef(uid), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const contributions = snap.docs.map((d) => d.data() as GoalContribution);
      onData(contributions);
    },
    onError
  );
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function addGoal(uid: string, goal: SavingsGoal): Promise<void> {
  await setDoc(goalDocRef(uid, goal.id), goal);
}

export async function updateGoal(uid: string, goal: SavingsGoal): Promise<void> {
  await setDoc(goalDocRef(uid, goal.id), goal, { merge: true });
}

export async function deleteGoal(uid: string, goalId: string): Promise<void> {
  await deleteDoc(goalDocRef(uid, goalId));
}

export async function addContribution(uid: string, contribution: GoalContribution): Promise<void> {
  await setDoc(contributionDocRef(uid, contribution.id), contribution);
}
