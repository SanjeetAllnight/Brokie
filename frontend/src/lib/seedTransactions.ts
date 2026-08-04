// Developer seed data — realistic mock transactions for development.
// Remove this file and its import in useTransactionStore.ts before production.

import type { Transaction } from '../types/transaction';
import { generateTransactionId } from '../lib/transactionHelpers';

const now = Date.now();
const daysAgo = (n: number) => now - n * 24 * 60 * 60 * 1000;
const hoursAgo = (h: number) => now - h * 60 * 60 * 1000;

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: generateTransactionId(),
    amount: 4.50,
    category: 'coffee',
    note: 'Morning latte',
    timestamp: hoursAgo(1),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 12.80,
    category: 'food',
    note: 'Lunch thali',
    timestamp: hoursAgo(4),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 32.00,
    category: 'transport',
    note: 'Uber to airport',
    timestamp: daysAgo(1),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 150.00,
    category: 'shopping',
    note: 'Impulse shoes (regret incoming)',
    timestamp: daysAgo(1),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 9.99,
    category: 'gaming',
    note: 'Game DLC',
    timestamp: daysAgo(2),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 85.50,
    category: 'food',
    note: 'Grocery run',
    timestamp: daysAgo(2),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 15.00,
    category: 'education',
    note: 'Udemy course',
    timestamp: daysAgo(3),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 6.50,
    category: 'coffee',
    note: 'Cold brew & croissant',
    timestamp: daysAgo(4),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 22.00,
    category: 'transport',
    note: 'Monthly metro pass top-up',
    timestamp: daysAgo(5),
    type: 'expense',
    regret: null,
  },
  {
    id: generateTransactionId(),
    amount: 49.99,
    category: 'shopping',
    note: 'Birthday gift',
    timestamp: daysAgo(6),
    type: 'expense',
    regret: null,
  },
];
