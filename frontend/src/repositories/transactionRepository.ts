// Transaction repository — manages users/{uid}/transactions subcollection.

import {
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import {
  transactionsColRef,
  transactionDocRef,
  transactionConverter,
  safeWrite,
} from '../firebase/firestoreHelpers';
import type { Transaction, RegretStatus } from '../types/transaction';

/** Writes a new transaction document to Firestore. */
export async function addTransaction(
  uid: string,
  transaction: Transaction
): Promise<void> {
  await safeWrite('addTransaction', () =>
    setDoc(
      transactionDocRef(uid, transaction.id).withConverter(transactionConverter),
      transaction
    )
  );
}

/** Updates the regret field on an existing transaction. */
export async function updateTransactionRegret(
  uid: string,
  txnId: string,
  regret: RegretStatus
): Promise<void> {
  await safeWrite('updateTransactionRegret', () =>
    updateDoc(transactionDocRef(uid, txnId), { regret })
  );
}

/** Subscribes to the most recent 200 transactions (newest first).
 *  Calls onData with the full Transaction array on every update.
 *  Returns an unsubscribe function. */
export function subscribeTransactions(
  uid: string,
  onData: (transactions: Transaction[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    transactionsColRef(uid).withConverter(transactionConverter),
    orderBy('timestamp', 'desc'),
    limit(200)
  );

  return onSnapshot(
    q,
    (snap) => {
      const transactions = snap.docs.map((d) => d.data());
      onData(transactions);
    },
    onError
  );
}
