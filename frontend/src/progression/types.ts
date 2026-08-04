export type StreakId =
  | 'dailyCheckIn'
  | 'expenseLogging'
  | 'underBudget'
  | 'resistance'
  | 'homeFood'
  | 'coffeeFree'
  | 'weekendSurvivor';

export interface StreakData {
  current: number;
  longest: number;
  lastUpdated: number; // ms timestamp
}

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  // Type of action needed to evaluate this quest
  type: 'log_expense' | 'log_resistance' | 'stay_above_danger' | 'spend_under_amount';
  // Optional condition value (e.g. amount < 300)
  targetValue?: number; 
  // Optional category condition
  targetCategory?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}

export interface ProgressionState {
  xp: number;
  streaks: Partial<Record<StreakId, StreakData>>;
  quests: {
    date: string; // YYYY-MM-DD
    completedIds: string[];
  };
  achievements: {
    id: string;
    unlockedAt: number;
  }[];
}
