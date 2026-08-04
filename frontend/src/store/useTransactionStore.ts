import { create } from 'zustand';
import type { Transaction, ExpenseCategory, RegretStatus } from '../types/transaction';
import {
  generateTransactionId,
  getTodayTransactions,
  getWeekTransactions,
  getMonthTransactions,
  sumTransactions,
  calcAverageDailySpend,
} from '../lib/transactionHelpers';

// Seed data is only used as the initial local value.
// Once Firestore hydration fires via hydrateTransactions(),
// the seed data is replaced entirely by Firestore data.
import { SEED_TRANSACTIONS } from '../lib/seedTransactions';

interface TransactionState {
  transactions: Transaction[];
  averageDailySpend: number;
  pendingRegretId: string | null;

  // Actions
  logExpense: (amount: number, category: ExpenseCategory, note: string) => string;
  setRegret: (id: string, status: RegretStatus) => void;
  clearTransactions: () => void;

  /** Called by useFirebaseSync to replace the full transaction list from Firestore.
   *  This is intentionally a full replace (not merge) so Firestore is always truth. */
  hydrateTransactions: (transactions: Transaction[]) => void;

  // Selectors
  getTodayTransactions: () => Transaction[];
  getWeekTransactions: () => Transaction[];
  getMonthTransactions: () => Transaction[];
  getTodayTotal: () => number;
  getMonthTotal: () => number;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [...SEED_TRANSACTIONS],
  averageDailySpend: calcAverageDailySpend(SEED_TRANSACTIONS),
  pendingRegretId: null,

  logExpense: (amount, category, note) => {
    const id = generateTransactionId();
    const newTransaction: Transaction = {
      id,
      amount,
      category,
      note,
      timestamp: Date.now(),
      type: 'expense',
      regret: null,
    };

    set((state) => {
      const updated = [newTransaction, ...state.transactions];
      return {
        transactions: updated,
        averageDailySpend: calcAverageDailySpend(updated),
        pendingRegretId: id,
      };
    });

    return id;
  },

  setRegret: (id, status) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, regret: status } : t
      ),
      pendingRegretId: null,
    }));
  },

  clearTransactions: () =>
    set({ transactions: [], averageDailySpend: 45, pendingRegretId: null }),

  hydrateTransactions: (transactions) => {
    set({
      transactions,
      averageDailySpend: calcAverageDailySpend(transactions),
    });
  },

  // Selectors
  getTodayTransactions: () => getTodayTransactions(get().transactions),
  getWeekTransactions:  () => getWeekTransactions(get().transactions),
  getMonthTransactions: () => getMonthTransactions(get().transactions),
  getTodayTotal:        () => sumTransactions(getTodayTransactions(get().transactions)),
  getMonthTotal:        () => sumTransactions(getMonthTransactions(get().transactions)),
}));
