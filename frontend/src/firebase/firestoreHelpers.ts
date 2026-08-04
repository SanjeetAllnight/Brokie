// Shared Firestore utilities: typed converters and a safe write wrapper.
// Keeps converter boilerplate out of individual repositories.

import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
} from 'firebase/firestore';
import {
  Timestamp,
  collection,
  doc,
} from 'firebase/firestore';
import { db } from './firebaseApp';
import type { Transaction } from '../types/transaction';
import type { ResistedTemptation } from '../types/resistance';

// ─── Path helpers ────────────────────────────────────────────────────────────

/** Returns the top-level user document reference. */
export function userDocRef(uid: string) {
  return doc(db, 'users', uid);
}

/** Returns the transactions subcollection reference for a user. */
export function transactionsColRef(uid: string) {
  return collection(db, 'users', uid, 'transactions');
}

/** Returns a specific transaction document reference. */
export function transactionDocRef(uid: string, txnId: string) {
  return doc(db, 'users', uid, 'transactions', txnId);
}

/** Returns the resistedTemptations subcollection reference. */
export function temptationsColRef(uid: string) {
  return collection(db, 'users', uid, 'resistedTemptations');
}

/** Returns a specific temptation document reference. */
export function temptationDocRef(uid: string, temptationId: string) {
  return doc(db, 'users', uid, 'resistedTemptations', temptationId);
}

// ─── Firestore Converters ────────────────────────────────────────────────────

/** Converts Transaction objects to/from Firestore documents.
 *  Firestore stores timestamps as Timestamp; we normalise to ms. */
export const transactionConverter: FirestoreDataConverter<Transaction> = {
  toFirestore(tx: Transaction): DocumentData {
    return {
      amount:    tx.amount,
      category:  tx.category,
      note:      tx.note,
      timestamp: Timestamp.fromMillis(tx.timestamp),
      type:      tx.type,
      regret:    tx.regret ?? null,
    };
  },
  fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): Transaction {
    const d = snap.data(options);
    return {
      id:        snap.id,
      amount:    d.amount,
      category:  d.category,
      note:      d.note ?? '',
      timestamp: (d.timestamp as Timestamp).toMillis(),
      type:      d.type,
      regret:    d.regret ?? null,
    };
  },
};

/** Converts ResistedTemptation objects to/from Firestore documents. */
export const temptationConverter: FirestoreDataConverter<ResistedTemptation> = {
  toFirestore(t: ResistedTemptation): DocumentData {
    return {
      itemName:        t.itemName,
      estimatedAmount: t.estimatedAmount,
      timestamp:       Timestamp.fromMillis(t.timestamp),
    };
  },
  fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): ResistedTemptation {
    const d = snap.data(options);
    return {
      id:              snap.id,
      itemName:        d.itemName,
      estimatedAmount: d.estimatedAmount,
      timestamp:       (d.timestamp as Timestamp).toMillis(),
    };
  },
};

// ─── Safe write wrapper ──────────────────────────────────────────────────────

/** Wraps any async Firestore write in a try/catch.
 *  Logs errors but never throws — keeps the UI from crashing on write failures. */
export async function safeWrite(
  label: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[Firestore] Write failed (${label}):`, err);
  }
}
