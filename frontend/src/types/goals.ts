export interface SavingsGoal {
  id: string;
  name: string;
  icon: string; // emoji
  targetAmount: number;
  currentAmount: number;
  createdAt: number;
  autoContribute: boolean; // if true, resisted temptations add to this goal
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  timestamp: number;
  source: 'manual' | 'resisted_temptation';
}
