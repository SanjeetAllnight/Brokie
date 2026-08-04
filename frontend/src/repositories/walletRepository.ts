// Wallet repository — reads and writes wallet fields on users/{uid}.
// Wallet state is stored as fields on the user document (not a subcollection).

import { updateDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { userDocRef, safeWrite } from '../firebase/firestoreHelpers';

export interface FirestoreWalletFields {
  currentBalance: number;
  dangerZoneThreshold: number;
  monthlyBudget: number;
  todaySpend: number;
  currentMonthIncome: number;
}

export const DEFAULT_WALLET: FirestoreWalletFields = {
  currentBalance: 0,
  dangerZoneThreshold: 0,
  monthlyBudget: 0,
  todaySpend: 0,
  currentMonthIncome: 0,
};

/** Writes wallet fields to the user document.
 *  Uses updateDoc (merge) so other fields on the document are not touched. */
export async function writeWallet(
  uid: string,
  fields: Partial<FirestoreWalletFields>
): Promise<void> {
  await safeWrite('writeWallet', () =>
    updateDoc(userDocRef(uid), fields as Record<string, unknown>)
  );
}

/** Subscribes to wallet field changes on the user document.
 *  Calls onData with the current wallet snapshot every time it changes.
 *  Returns an unsubscribe function. */
export function subscribeWallet(
  uid: string,
  onData: (wallet: Partial<FirestoreWalletFields>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const wallet: Partial<FirestoreWalletFields> = {};
      if (d.currentBalance !== undefined)      wallet.currentBalance      = d.currentBalance;
      if (d.dangerZoneThreshold !== undefined) wallet.dangerZoneThreshold = d.dangerZoneThreshold;
      if (d.monthlyBudget !== undefined)       wallet.monthlyBudget       = d.monthlyBudget;
      if (d.todaySpend !== undefined)          wallet.todaySpend          = d.todaySpend;
      if (d.currentMonthIncome !== undefined)  wallet.currentMonthIncome  = d.currentMonthIncome;
      onData(wallet);
    },
    onError
  );
}
