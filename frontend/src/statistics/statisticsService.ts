// Statistics service — the single source of all derived financial calculations.
//
// Architecture:
//   Repositories → Stores → Statistics (this module) → UI
//
// Rules:
// • All functions are pure (no side effects, no imports of stores)
// • Inputs are plain data arrays from stores
// • Outputs are typed result objects
// • Memoisation is the responsibility of the caller hook (useStatistics)

import type { Transaction, ExpenseCategory, RegretStatus } from '../types/transaction';
import type { ResistedTemptation } from '../types/resistance';
import { CATEGORIES } from '../types/transaction';
import {
  getTodayTransactions,
  getWeekTransactions,
  getMonthTransactions,
  sumTransactions,
} from '../lib/transactionHelpers';

// ─── Filters ─────────────────────────────────────────────────────────────────

export type DateFilter = 'day' | 'week' | 'month' | 'year';
export type SortOrder  = 'newest' | 'oldest' | 'highest' | 'lowest';

export function getYearTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => new Date(t.timestamp).getFullYear() === now.getFullYear());
}

/** Returns a filtered and sorted subset of transactions. */
export function filterTransactions(
  transactions: Transaction[],
  dateFilter: DateFilter,
  category: ExpenseCategory | 'all',
  sort: SortOrder
): Transaction[] {
  let filtered: Transaction[];

  switch (dateFilter) {
    case 'day':   filtered = getTodayTransactions(transactions); break;
    case 'week':  filtered = getWeekTransactions(transactions);  break;
    case 'month': filtered = getMonthTransactions(transactions); break;
    case 'year':  filtered = getYearTransactions(transactions);  break;
  }

  if (category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }

  switch (sort) {
    case 'newest':  return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    case 'oldest':  return [...filtered].sort((a, b) => a.timestamp - b.timestamp);
    case 'highest': return [...filtered].sort((a, b) => b.amount - a.amount);
    case 'lowest':  return [...filtered].sort((a, b) => a.amount - b.amount);
  }
}

// ─── Spending summaries ───────────────────────────────────────────────────────

export interface SpendingSummary {
  todayTotal:    number;
  weekTotal:     number;
  monthTotal:    number;
  yearTotal:     number;
  allTimeTotal:  number;
  averageDaily:  number; // based on last 30 days
}

export function calcSpendingSummary(transactions: Transaction[]): SpendingSummary {
  const todayTotal   = sumTransactions(getTodayTransactions(transactions));
  const weekTotal    = sumTransactions(getWeekTransactions(transactions));
  const monthTotal   = sumTransactions(getMonthTransactions(transactions));
  const yearTotal    = sumTransactions(getYearTransactions(transactions));
  const allTimeTotal = sumTransactions(transactions);

  // Average daily over last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = transactions.filter((t) => t.timestamp >= thirtyDaysAgo);
  let averageDaily = 45; // safe default
  if (recent.length > 0) {
    const oldestRecent = Math.min(...recent.map((t) => t.timestamp));
    const spanDays = Math.max(1, (Date.now() - oldestRecent) / (24 * 60 * 60 * 1000));
    averageDaily = sumTransactions(recent) / spanDays;
  }

  return { todayTotal, weekTotal, monthTotal, yearTotal, allTimeTotal, averageDaily };
}

// ─── Category breakdown ───────────────────────────────────────────────────────

export interface CategoryBreakdownItem {
  category:    ExpenseCategory;
  label:       string;
  icon:        string;
  total:       number;
  percentage:  number;   // 0–100
  count:       number;
}

export function calcCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdownItem[] {
  const grandTotal = sumTransactions(transactions);

  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { total: 0, count: 0 };
    acc[t.category].total += t.amount;
    acc[t.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return CATEGORIES
    .map((cat) => {
      const data = grouped[cat.id] ?? { total: 0, count: 0 };
      return {
        category:   cat.id,
        label:      cat.label,
        icon:       cat.icon,
        total:      data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
        count:      data.count,
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

// ─── Top Movers ───────────────────────────────────────────────────────────────

export interface TopMover {
  category:    ExpenseCategory;
  label:       string;
  icon:        string;
  total:       number;
  percentage:  number; // share of total spending
}

export function calcTopSpendingCategories(
  transactions: Transaction[],
  limit = 5
): TopMover[] {
  const breakdown = calcCategoryBreakdown(transactions);
  return breakdown.slice(0, limit).map((item) => ({
    category:   item.category,
    label:      item.label,
    icon:       item.icon,
    total:      item.total,
    percentage: item.percentage,
  }));
}

export interface HighestExpense {
  transaction: Transaction;
  categoryLabel: string;
  categoryIcon:  string;
}

export function calcHighestExpenses(
  transactions: Transaction[],
  limit = 5
): HighestExpense[] {
  return [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((t) => {
      const cat = CATEGORIES.find((c) => c.id === t.category);
      return {
        transaction:   t,
        categoryLabel: cat?.label ?? t.category,
        categoryIcon:  cat?.icon ?? 'receipt',
      };
    });
}

export function calcLargestExpenseThisMonth(
  transactions: Transaction[]
): HighestExpense | null {
  const monthly = getMonthTransactions(transactions);
  if (monthly.length === 0) return null;
  const top = monthly.reduce((max, t) => (t.amount > max.amount ? t : max), monthly[0]);
  const cat = CATEGORIES.find((c) => c.id === top.category);
  return {
    transaction:   top,
    categoryLabel: cat?.label ?? top.category,
    categoryIcon:  cat?.icon ?? 'receipt',
  };
}

export function calcMostFrequentCategory(
  transactions: Transaction[]
): CategoryBreakdownItem | null {
  const breakdown = calcCategoryBreakdown(transactions);
  if (breakdown.length === 0) return null;
  return breakdown.reduce((max, item) => (item.count > max.count ? item : max), breakdown[0]);
}

// ─── Regret analytics ────────────────────────────────────────────────────────

export interface RegretAnalytics {
  worthItCount:        number;
  instantRegretCount:  number;
  pendingCount:        number;
  regretPercentage:    number;  // 0–100 of rated transactions
  recentRegrets:       Transaction[];
  mostRegrettedCategory: ExpenseCategory | null;
  mostRegrettedLabel:    string | null;
}

export function calcRegretAnalytics(
  transactions: Transaction[],
  recentLimit = 5
): RegretAnalytics {
  const rated      = transactions.filter((t) => t.regret !== null);
  const worthIt    = rated.filter((t) => t.regret === ('worth_it' as RegretStatus));
  const regretted  = rated.filter((t) => t.regret === ('instant_regret' as RegretStatus));
  const pending    = transactions.filter((t) => t.regret === null);

  const regretPercentage = rated.length > 0
    ? (regretted.length / rated.length) * 100
    : 0;

  const recentRegrets = transactions
    .filter((t) => t.regret === ('instant_regret' as RegretStatus))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, recentLimit);

  // Most regreted category by total amount regretted
  const regretByCategory: Partial<Record<ExpenseCategory, number>> = {};
  regretted.forEach((t) => {
    regretByCategory[t.category] = (regretByCategory[t.category] ?? 0) + t.amount;
  });

  let mostRegrettedCategory: ExpenseCategory | null = null;
  let maxRegretAmount = 0;
  (Object.entries(regretByCategory) as [ExpenseCategory, number][]).forEach(([cat, amt]) => {
    if (amt > maxRegretAmount) {
      maxRegretAmount = amt;
      mostRegrettedCategory = cat;
    }
  });

  const mostRegrettedLabel = mostRegrettedCategory
    ? (CATEGORIES.find((c) => c.id === mostRegrettedCategory)?.label ?? null)
    : null;

  return {
    worthItCount:        worthIt.length,
    instantRegretCount:  regretted.length,
    pendingCount:        pending.length,
    regretPercentage,
    recentRegrets,
    mostRegrettedCategory,
    mostRegrettedLabel,
  };
}

// ─── Resistance analytics ─────────────────────────────────────────────────────

export interface ResistanceAnalytics {
  totalResistedAmount:  number;
  averageTemptationValue: number;
  temptationCount:      number;
  recentTemptations:    ResistedTemptation[];
  highestResisted:      ResistedTemptation | null;
}

export function calcResistanceAnalytics(
  temptations: ResistedTemptation[],
  recentLimit = 5
): ResistanceAnalytics {
  const totalResistedAmount = temptations.reduce((s, t) => s + t.estimatedAmount, 0);
  const averageTemptationValue = temptations.length > 0
    ? totalResistedAmount / temptations.length
    : 0;

  const recentTemptations = [...temptations]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, recentLimit);

  const highestResisted = temptations.length > 0
    ? temptations.reduce((max, t) => (t.estimatedAmount > max.estimatedAmount ? t : max), temptations[0])
    : null;

  return {
    totalResistedAmount,
    averageTemptationValue,
    temptationCount: temptations.length,
    recentTemptations,
    highestResisted,
  };
}

// ─── Donut chart data ─────────────────────────────────────────────────────────

export interface DonutSegment {
  category:   ExpenseCategory;
  label:      string;
  percentage: number;
  total:      number;
  color:      string; // CSS colour token / class
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food:      'hsl(var(--color-primary))',
  coffee:    'hsl(var(--color-secondary))',
  transport: 'hsl(var(--color-tertiary))',
  shopping:  '#f59e0b',
  gaming:    '#8b5cf6',
  education: '#10b981',
  other:     '#94a3b8',
};

export function calcDonutSegments(transactions: Transaction[]): DonutSegment[] {
  return calcCategoryBreakdown(transactions)
    .filter((item) => item.percentage > 0)
    .map((item) => ({
      category:   item.category,
      label:      item.label,
      percentage: item.percentage,
      total:      item.total,
      color:      CATEGORY_COLORS[item.category] ?? '#94a3b8',
    }));
}
