import type { Quest, Achievement } from './types';

// ─── XP Awards ───────────────────────────────────────────────────────────────

export const XP_AWARDS = {
  LOG_EXPENSE: 10,
  LOG_RESISTANCE: 15,
  COMPLETE_QUEST: 50,
  PERFECT_DAY: 100, // all 3 quests completed
  STREAK_MAINTAINED: 5,
};

// ─── Levels ──────────────────────────────────────────────────────────────────

export interface LevelConfig {
  level: number;
  title: string;
  minXp: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'Wallet Rookie', minXp: 0 },
  { level: 2, title: 'Budget Goblin', minXp: 100 },
  { level: 3, title: 'Coupon Hunter', minXp: 250 },
  { level: 4, title: 'Financial Survivor', minXp: 500 },
  { level: 5, title: 'Money Wizard', minXp: 1000 },
  { level: 6, title: 'Wealth Lord', minXp: 2000 },
];

export function getLevelForXp(xp: number): LevelConfig {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

// ─── Master Quest List ───────────────────────────────────────────────────────

export const MASTER_QUESTS: Quest[] = [
  {
    id: 'q_log_any',
    title: 'Log an expense today',
    xpReward: 50,
    type: 'log_expense'
  },
  {
    id: 'q_no_shopping',
    title: 'No shopping today',
    xpReward: 50,
    type: 'log_expense',
    targetCategory: 'shopping' // engine checks if you DID log shopping, if not at end of day (or on log) it might be tricky. Actually, we'll evaluate if this fails when they log shopping. Wait, it's easier to say "completed" vs "failed". We'll just stick to positive quests for now.
  },
  {
    id: 'q_resist_one',
    title: 'Resist a temptation',
    xpReward: 50,
    type: 'log_resistance'
  },
  {
    id: 'q_stay_safe',
    title: 'Stay above danger zone',
    xpReward: 50,
    type: 'stay_above_danger'
  },
  {
    id: 'q_spend_under_300',
    title: 'Spend under $300 today',
    xpReward: 50,
    type: 'spend_under_amount',
    targetValue: 300
  },
  {
    id: 'q_home_food',
    title: 'Log a food expense',
    xpReward: 50,
    type: 'log_expense',
    targetCategory: 'food'
  }
];

// We will replace negative quests (no shopping) with positive ones so they can be triggered via engine interception.
export const ACTIVE_QUEST_POOL: Quest[] = [
  {
    id: 'q_log_any',
    title: 'Log an expense today',
    xpReward: 50,
    type: 'log_expense'
  },
  {
    id: 'q_resist_one',
    title: 'Resist a temptation',
    xpReward: 50,
    type: 'log_resistance'
  },
  {
    id: 'q_stay_safe',
    title: 'Stay above danger zone (Log safely)',
    xpReward: 50,
    type: 'stay_above_danger' // Triggered when any expense is logged and balance remains > danger
  },
  {
    id: 'q_home_food',
    title: 'Log a food expense',
    xpReward: 50,
    type: 'log_expense',
    targetCategory: 'food'
  },
  {
    id: 'q_transport',
    title: 'Log a transport expense',
    xpReward: 50,
    type: 'log_expense',
    targetCategory: 'transport'
  }
];

// ─── Master Achievement List ─────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_expense',
    title: 'First Blood',
    description: 'Log your first expense.',
    xpReward: 50,
  },
  {
    id: 'ach_first_resist',
    title: 'Willpower',
    description: 'Resist your first temptation.',
    xpReward: 50,
  },
  {
    id: 'ach_regret',
    title: 'Mistakes Were Made',
    description: 'Rate an expense as Instant Regret.',
    xpReward: 50,
  }
];
