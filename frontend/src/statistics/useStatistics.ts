// useStatistics — reactive hook that memoises all statistical calculations.
//
// Components import ONLY this hook for statistics.
// The hook reads from Zustand stores and calls statisticsService functions.
// useMemo ensures expensive calculations don't re-run on every render.

import { useMemo } from 'react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useResistanceStore } from '../store/useResistanceStore';
import { useWalletStore, useDerivedWalletState } from '../store/useWalletStore';
import {
  calcSpendingSummary,
  calcCategoryBreakdown,
  calcTopSpendingCategories,
  calcHighestExpenses,
  calcLargestExpenseThisMonth,
  calcMostFrequentCategory,
  calcRegretAnalytics,
  calcResistanceAnalytics,
  calcDonutSegments,
  filterTransactions,
  type DateFilter,
  type SortOrder,
} from './statisticsService';
import type { ExpenseCategory } from '../types/transaction';
import { getMonthTransactions, getWeekTransactions } from '../lib/transactionHelpers';

export function useStatistics() {
  const transactions = useTransactionStore((s) => s.transactions);
  const temptations  = useResistanceStore((s) => s.temptations);
  const averageDailySpend = useTransactionStore((s) => s.averageDailySpend);
  const derived = useDerivedWalletState(averageDailySpend);

  const spending = useMemo(
    () => calcSpendingSummary(transactions),
    [transactions]
  );

  const categoryBreakdown = useMemo(
    () => calcCategoryBreakdown(transactions),
    [transactions]
  );

  const monthlyBreakdown = useMemo(() => {
    return calcCategoryBreakdown(getMonthTransactions(transactions));
  }, [transactions]);

  const topCategories = useMemo(
    () => calcTopSpendingCategories(transactions),
    [transactions]
  );

  const highestExpenses = useMemo(
    () => calcHighestExpenses(transactions),
    [transactions]
  );

  const largestThisMonth = useMemo(
    () => calcLargestExpenseThisMonth(transactions),
    [transactions]
  );

  const mostFrequentCategory = useMemo(
    () => calcMostFrequentCategory(transactions),
    [transactions]
  );

  const regret = useMemo(
    () => calcRegretAnalytics(transactions),
    [transactions]
  );

  const resistance = useMemo(
    () => calcResistanceAnalytics(temptations),
    [temptations]
  );

  const donutSegments = useMemo(
    () => calcDonutSegments(transactions),
    [transactions]
  );

  const monthlyDonutSegments = useMemo(() => {
    return calcDonutSegments(getMonthTransactions(transactions));
  }, [transactions]);

  return {
    // Wallet derived
    ...derived,
    averageDailySpend,

    // Spending summaries
    spending,

    // Category data
    categoryBreakdown,
    monthlyBreakdown,
    topCategories,

    // Top movers
    highestExpenses,
    largestThisMonth,
    mostFrequentCategory,

    // Regret
    regret,

    // Resistance
    resistance,

    // Chart data
    donutSegments,
    monthlyDonutSegments,
  };
}

/** Filtered transaction list hook — use for list views. */
export function useFilteredTransactions(
  dateFilter: DateFilter,
  category: ExpenseCategory | 'all',
  sort: SortOrder
) {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(
    () => filterTransactions(transactions, dateFilter, category, sort),
    [transactions, dateFilter, category, sort]
  );
}

/** Quick read of wallet state for dashboard cards. */
export function useDashboardStats() {
  const currentBalance = useWalletStore((s) => s.currentBalance);
  const todaySpend     = useWalletStore((s) => s.todaySpend);
  const averageDailySpend = useTransactionStore((s) => s.averageDailySpend);
  const derived = useDerivedWalletState(averageDailySpend);

  const transactions = useTransactionStore((s) => s.transactions);
  const weekTotal  = useMemo(() => {
    return getWeekTransactions(transactions).reduce((s, t) => s + t.amount, 0);
  }, [transactions]);
  const monthTotal = useMemo(() => {
    return getMonthTransactions(transactions).reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  return {
    currentBalance,
    todaySpend,
    weekTotal,
    monthTotal,
    averageDailySpend,
    ...derived,
  };
}
