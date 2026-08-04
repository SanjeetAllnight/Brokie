// Transaction types — structured for future Firestore compatibility.
// When migrating to Firestore, these types remain unchanged;
// only the data source (Zustand arrays → Firestore collection) changes.

export type TransactionType = 'expense';

export type ExpenseCategory =
  | 'food'
  | 'coffee'
  | 'transport'
  | 'shopping'
  | 'gaming'
  | 'education'
  | 'other';

/** Set after the Worth It? check-in. null = pending (user hasn't rated yet). */
export type RegretStatus = 'worth_it' | 'instant_regret';

export interface Transaction {
  id: string;
  amount: number;         // Always positive. For expenses, wallet is debited.
  category: ExpenseCategory;
  note: string;           // Optional note; empty string if not provided
  timestamp: number;      // Unix timestamp (ms) — matches Firestore Timestamp.toMillis()
  type: TransactionType;
  regret: RegretStatus | null; // null until the Worth It? screen is completed
}

// Category metadata for UI rendering — keeps display logic out of components.
export interface CategoryMeta {
  id: ExpenseCategory;
  label: string;
  icon: string;           // Material Symbols icon name
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food',      label: 'Food',      icon: 'restaurant' },
  { id: 'coffee',    label: 'Coffee',    icon: 'coffee' },
  { id: 'transport', label: 'Transport', icon: 'directions_car' },
  { id: 'shopping',  label: 'Shopping',  icon: 'shopping_bag' },
  { id: 'gaming',    label: 'Gaming',    icon: 'sports_esports' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'other',     label: 'Other',     icon: 'more_horiz' },
];
