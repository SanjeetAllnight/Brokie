// Utility helpers for transaction data.
// All business logic lives here, not in React components.

import type { Transaction, ExpenseCategory } from '../types/transaction';

/** Generates a simple unique ID for local transactions.
 *  Firestore will replace this with a document ID on migration. */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Checks if two timestamps are on the same calendar day (local timezone). */
function isSameDay(timestampA: number, timestampB: number): boolean {
  const a = new Date(timestampA);
  const b = new Date(timestampB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Returns transactions that occurred today. */
export function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  const now = Date.now();
  return transactions.filter((t) => isSameDay(t.timestamp, now));
}

/** Returns transactions from the last 7 days. */
export function getWeekTransactions(transactions: Transaction[]): Transaction[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return transactions.filter((t) => t.timestamp >= weekAgo);
}

/** Returns transactions from the current calendar month. */
export function getMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

/** Sums the total amount across a list of transactions. */
export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}

/** Calculates the average daily spend based on transactions in the last 30 days.
 *  Falls back to a safe default to avoid division by zero. */
export function calcAverageDailySpend(transactions: Transaction[]): number {
  const SAFE_DEFAULT_DAILY = 45;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = transactions.filter((t) => t.timestamp >= thirtyDaysAgo);
  if (recent.length === 0) return SAFE_DEFAULT_DAILY;

  const total = sumTransactions(recent);
  // Span in days between the oldest transaction and now, minimum 1
  const oldest = Math.min(...recent.map((t) => t.timestamp));
  const spanDays = Math.max(1, (Date.now() - oldest) / (24 * 60 * 60 * 1000));
  return total / spanDays;
}

/** Aggregates spending by category for a list of transactions. */
export function spendByCategory(
  transactions: Transaction[]
): Partial<Record<ExpenseCategory, number>> {
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {} as Partial<Record<ExpenseCategory, number>>);
}
