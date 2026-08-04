import { create } from 'zustand';
import type { SavingsGoal, GoalContribution } from '../types/goals';
import { v4 as uuidv4 } from 'uuid';

interface GoalsState {
  goals: SavingsGoal[];
  contributions: GoalContribution[];

  // Actions
  addGoal: (name: string, icon: string, targetAmount: number, autoContribute: boolean) => string;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, source: GoalContribution['source']) => string;

  // Hydration
  hydrateGoals: (goals: SavingsGoal[]) => void;
  hydrateContributions: (contributions: GoalContribution[]) => void;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  contributions: [],

  addGoal: (name, icon, targetAmount, autoContribute) => {
    const id = uuidv4();
    const newGoal: SavingsGoal = {
      id,
      name,
      icon,
      targetAmount,
      currentAmount: 0,
      createdAt: Date.now(),
      autoContribute,
    };
    set((state) => ({ goals: [newGoal, ...state.goals] }));
    return id;
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  addContribution: (goalId, amount, source) => {
    const id = uuidv4();
    const newContribution: GoalContribution = {
      id,
      goalId,
      amount,
      timestamp: Date.now(),
      source,
    };
    
    set((state) => {
      const goals = state.goals.map(g => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      });
      return {
        goals,
        contributions: [newContribution, ...state.contributions],
      };
    });
    
    return id;
  },

  hydrateGoals: (goals) => set({ goals }),
  hydrateContributions: (contributions) => set({ contributions }),
}));
