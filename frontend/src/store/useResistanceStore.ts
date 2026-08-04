import { create } from 'zustand';
import type { ResistedTemptation } from '../types/resistance';
import { generateTransactionId } from '../lib/transactionHelpers';

// ─── Selectors (pure functions — no side effects) ────────────────────────────

export function getTotalResistedAmount(temptations: ResistedTemptation[]): number {
  return temptations.reduce((acc, t) => acc + t.estimatedAmount, 0);
}

export function getRecentTemptations(
  temptations: ResistedTemptation[],
  limit = 5
): ResistedTemptation[] {
  return temptations.slice(0, limit);
}

export function getTemptationCount(temptations: ResistedTemptation[]): number {
  return temptations.length;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ResistanceState {
  temptations: ResistedTemptation[];

  // Actions
  logTemptation: (itemName: string, estimatedAmount: number) => string;
  clearTemptations: () => void;

  /** Called by useFirebaseSync to replace the full temptation list from Firestore. */
  hydrateTemptations: (temptations: ResistedTemptation[]) => void;

  // Selector wrappers
  getTotalResistedAmount: () => number;
  getRecentTemptations: (limit?: number) => ResistedTemptation[];
  getTemptationCount: () => number;
}

export const useResistanceStore = create<ResistanceState>((set, get) => ({
  temptations: [],

  logTemptation: (itemName, estimatedAmount) => {
    const id = generateTransactionId();
    const newTemptation: ResistedTemptation = {
      id,
      itemName: itemName.trim(),
      estimatedAmount,
      timestamp: Date.now(),
    };

    set((state) => ({
      temptations: [newTemptation, ...state.temptations],
    }));

    return id;
  },

  clearTemptations: () => set({ temptations: [] }),

  hydrateTemptations: (temptations) => set({ temptations }),

  // Selector wrappers
  getTotalResistedAmount: () => getTotalResistedAmount(get().temptations),
  getRecentTemptations:   (limit) => getRecentTemptations(get().temptations, limit),
  getTemptationCount:     () => getTemptationCount(get().temptations),
}));
