import { create } from 'zustand';
import type { FirestoreWalletFields } from '../repositories/walletRepository';

// ─── Wallet store ─────────────────────────────────────────────────────────────
// Wallet fields are stored as fields on users/{uid} in Firestore.
// useFirebaseSync hydrates this store via hydrateWallet() after the
// onSnapshot fires, and calls writeWallet() from walletRepository
// whenever state changes that must be persisted.

interface WalletState {
  currentBalance: number;
  dangerZoneThreshold: number;
  monthlyBudget: number;
  todaySpend: number;
  currentMonthIncome: number;

  // Actions (local state only)
  increaseWallet: (amount: number) => void;
  decreaseWallet: (amount: number) => void;
  setBalance: (amount: number) => void;
  setMonthlyBudget: (amount: number) => void;
  setDangerZoneThreshold: (amount: number) => void;
  addTodaySpend: (amount: number) => void;
  resetWallet: () => void;

  /** Called by useFirebaseSync to hydrate the store from Firestore.
   *  Partial so that a Firestore document with missing fields doesn't
   *  wipe local defaults. */
  hydrateWallet: (fields: Partial<FirestoreWalletFields>) => void;
}

const initialState = {
  currentBalance: 0,
  dangerZoneThreshold: 0,
  monthlyBudget: 0,
  todaySpend: 0,
  currentMonthIncome: 0,
};

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,

  increaseWallet: (amount) =>
    set((state) => ({ currentBalance: state.currentBalance + amount })),

  decreaseWallet: (amount) =>
    set((state) => ({ currentBalance: state.currentBalance - amount })),

  setBalance: (amount) => set({ currentBalance: amount }),

  setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),

  setDangerZoneThreshold: (amount) => set({ dangerZoneThreshold: amount }),

  addTodaySpend: (amount) =>
    set((state) => ({ todaySpend: state.todaySpend + amount })),

  resetWallet: () => set(initialState),

  hydrateWallet: (fields) => set(fields),
}));

// ─── Derived wallet state ─────────────────────────────────────────────────────
// Computed on every render that calls this hook.
// All business logic lives here so components stay free of calculations.

export function useDerivedWalletState(averageDailySpend?: number) {
  const currentBalance      = useWalletStore((state) => state.currentBalance);
  const dangerZoneThreshold = useWalletStore((state) => state.dangerZoneThreshold);
  const monthlyBudget       = useWalletStore((state) => state.monthlyBudget);

  // Wallet HP: 0–100% relative to monthly budget
  const walletHP = monthlyBudget > 0 
    ? Math.max(0, Math.min(100, (currentBalance / monthlyBudget) * 100))
    : 0;

  // Danger Zone Distance
  const distanceToDangerZone = currentBalance - dangerZoneThreshold;
  const isAboveDangerZone    = distanceToDangerZone >= 0;
  const dangerZoneAmount     = Math.abs(distanceToDangerZone).toFixed(2);
  const dangerZoneDirection  = isAboveDangerZone ? 'above' : 'below';

  // Broke Meter
  const balancePercentage = currentBalance / monthlyBudget;
  let brokeMeterStatus = 'Broke';
  let brokeMeterIcon   = '💀';

  if (balancePercentage > 0.5) {
    brokeMeterStatus = 'Vibing';
    brokeMeterIcon   = '🟢';
  } else if (balancePercentage > 0.25) {
    brokeMeterStatus = 'Careful';
    brokeMeterIcon   = '🟡';
  } else if (balancePercentage > 0.10) {
    brokeMeterStatus = 'Questionable';
    brokeMeterIcon   = '🟠';
  } else if (currentBalance > 0) {
    brokeMeterStatus = 'Rice & Maggi Mode';
    brokeMeterIcon   = '🔴';
  }

  // Estimated Survival Days
  const dailySpend = averageDailySpend && averageDailySpend > 0 ? averageDailySpend : 45;
  const estimatedSurvivalDays = Math.max(0, Math.floor(currentBalance / dailySpend));

  return {
    walletHP,
    distanceToDangerZone,
    isAboveDangerZone,
    dangerZoneAmount,
    dangerZoneDirection,
    brokeMeterStatus,
    brokeMeterIcon,
    estimatedSurvivalDays,
  };
}
