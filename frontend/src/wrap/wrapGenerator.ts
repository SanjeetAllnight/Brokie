import type { Transaction } from '../types/transaction';
import type { ResistedTemptation } from '../types/resistance';
import { calcSpendingSummary, calcCategoryBreakdown, calcRegretAnalytics, calcResistanceAnalytics, calcLargestExpenseThisMonth } from '../statistics/statisticsService';

// ─── Financial Personality Algortihm ──────────────────────────────────────────

export type FinancialPersonality = 'Foodie' | 'Coffee Goblin' | 'Minimalist' | 'Impulse Buyer' | 'Weekend Spender' | 'Budget Guardian';

function calculatePersonality(transactions: Transaction[], regrets: Transaction[], resisted: ResistedTemptation[]): FinancialPersonality {
  if (transactions.length === 0) return 'Minimalist';

  const breakdown = calcCategoryBreakdown(transactions);
  if (breakdown.length === 0) return 'Minimalist';
  
  const coffee = breakdown.find(c => c.category === 'coffee');
  if (coffee && coffee.percentage > 30) return 'Coffee Goblin';

  const food = breakdown.find(c => c.category === 'food');
  if (food && food.percentage > 40) return 'Foodie';

  const regretCount = regrets.length;
  if (regretCount > 3) return 'Impulse Buyer';

  // Check weekend spending
  const weekendTx = transactions.filter(t => {
    const day = new Date(t.timestamp).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });
  
  if (weekendTx.length > transactions.length / 2) return 'Weekend Spender';

  if (resisted.length > 5) return 'Budget Guardian';

  return 'Minimalist'; // Default
}

// ─── Wrap Generator ──────────────────────────────────────────────────────────

export interface MonthlyWrapData {
  totalSpent: number;
  remainingBalance: number;
  averageDailySpend: number;
  transactionCount: number;
  
  biggestCategory: { label: string; amount: number; percentage: number } | null;
  biggestExpense: { label: string; amount: number; icon: string } | null;
  
  coffeeCount: number;
  
  mostRegrettedPurchase: { label: string; amount: number } | null;
  mostRegrettedCategory: { label: string; amount: number } | null;
  
  totalResistedAmount: number;
  largestTemptation: { label: string; amount: number } | null;
  
  personality: FinancialPersonality;
  survivalStatus: string;
}

export function generateMonthlyWrap(
  monthlyTransactions: Transaction[],
  allTransactions: Transaction[],
  temptations: ResistedTemptation[],
  currentBalance: number,
  walletHP: number
): MonthlyWrapData {
  const spending = calcSpendingSummary(monthlyTransactions);
  const breakdown = calcCategoryBreakdown(monthlyTransactions);
  const regretAnalytics = calcRegretAnalytics(monthlyTransactions);
  const resistanceAnalytics = calcResistanceAnalytics(temptations); // from all time or monthly? Let's use all temptations passed in (likely monthly filtered if we want)

  const biggestCategory = breakdown.length > 0 ? {
    label: breakdown[0].label,
    amount: breakdown[0].total,
    percentage: breakdown[0].percentage
  } : null;

  const largestExpense = calcLargestExpenseThisMonth(allTransactions); // uses monthly filter internally
  
  const coffeeItem = breakdown.find(b => b.category === 'coffee');
  const coffeeCount = coffeeItem ? coffeeItem.count : 0;

  const mostRegrettedPurchase = regretAnalytics.recentRegrets.length > 0 
    ? { label: regretAnalytics.recentRegrets[0].note || regretAnalytics.recentRegrets[0].category, amount: regretAnalytics.recentRegrets[0].amount }
    : null;

  const mostRegrettedCategory = regretAnalytics.mostRegrettedCategory 
    ? { label: regretAnalytics.mostRegrettedLabel || 'Unknown', amount: 0 } // Amount isn't directly exposed by regretAnalytics, but we have the label
    : null;

  const largestTemptation = resistanceAnalytics.highestResisted
    ? { label: resistanceAnalytics.highestResisted.itemName, amount: resistanceAnalytics.highestResisted.estimatedAmount }
    : null;

  const personality = calculatePersonality(
    monthlyTransactions, 
    regretAnalytics.recentRegrets, 
    temptations
  );

  let survivalStatus = 'Surviving';
  if (walletHP > 80) survivalStatus = 'Thriving';
  else if (walletHP < 30) survivalStatus = 'On Life Support';

  return {
    totalSpent: spending.allTimeTotal, // Since we pass monthlyTransactions, allTimeTotal of that subset IS the month total
    remainingBalance: currentBalance,
    averageDailySpend: spending.allTimeTotal / (new Date().getDate() || 1), // rough average for current month
    transactionCount: monthlyTransactions.length,
    biggestCategory,
    biggestExpense: largestExpense ? { label: largestExpense.categoryLabel, amount: largestExpense.transaction.amount, icon: largestExpense.categoryIcon } : null,
    coffeeCount,
    mostRegrettedPurchase,
    mostRegrettedCategory,
    totalResistedAmount: resistanceAnalytics.totalResistedAmount,
    largestTemptation,
    personality,
    survivalStatus
  };
}
