import { create } from 'zustand';
import type { ProgressionState, StreakId } from '../progression/types';
import { getTodayDateString } from '../progression/questService';

interface ProgressionStoreState extends ProgressionState {
  hydrateProgression: (state: ProgressionState) => void;
  // Expose methods for the engine to call
  addXp: (amount: number) => void;
  updateStreak: (id: StreakId) => void; // call this to bump a streak for today
  completeQuest: (questId: string) => void;
  unlockAchievement: (achievementId: string) => void;
}

const initialState: ProgressionState = {
  xp: 0,
  streaks: {},
  quests: {
    date: getTodayDateString(),
    completedIds: [],
  },
  achievements: [],
};

export const useProgressionStore = create<ProgressionStoreState>((set) => ({
  ...initialState,

  hydrateProgression: (state) => set(state),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + amount })),

  updateStreak: (id) =>
    set((state) => {
      const now = Date.now();
      const currentStreak = state.streaks[id] || { current: 0, longest: 0, lastUpdated: 0 };
      
      // Basic logic: if updated today, do nothing. If updated yesterday, current++. Else current = 1.
      // We will do a simple day-based check here, but more complex logic lives in engine or here.
      // For simplicity, just bump it here if it's a new day.
      const lastDate = new Date(currentStreak.lastUpdated).toDateString();
      const todayDate = new Date(now).toDateString();
      
      let newCurrent = currentStreak.current;
      if (lastDate !== todayDate) {
        // Did we miss a day?
        const yesterday = new Date(now - 86400000).toDateString();
        if (lastDate === yesterday) {
          newCurrent += 1;
        } else {
          newCurrent = 1;
        }
      }

      const newLongest = Math.max(currentStreak.longest, newCurrent);

      return {
        streaks: {
          ...state.streaks,
          [id]: {
            current: newCurrent,
            longest: newLongest,
            lastUpdated: now,
          },
        },
      };
    }),

  completeQuest: (questId) =>
    set((state) => {
      const today = getTodayDateString();
      // If date mismatch, reset quests
      if (state.quests.date !== today) {
        return {
          quests: {
            date: today,
            completedIds: [questId],
          }
        };
      }
      
      if (state.quests.completedIds.includes(questId)) return state; // already completed

      return {
        quests: {
          ...state.quests,
          completedIds: [...state.quests.completedIds, questId],
        }
      };
    }),

  unlockAchievement: (achievementId) =>
    set((state) => {
      if (state.achievements.some((a) => a.id === achievementId)) return state;
      return {
        achievements: [
          ...state.achievements,
          { id: achievementId, unlockedAt: Date.now() },
        ],
      };
    }),
}));
