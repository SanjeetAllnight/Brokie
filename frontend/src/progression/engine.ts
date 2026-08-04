import { useProgressionStore } from '../store/useProgressionStore';
import { useWalletStore } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';
import { generateDailyQuests, getTodayDateString } from './questService';
import { XP_AWARDS, ACHIEVEMENTS } from './config';
import type { Transaction, RegretStatus } from '../types/transaction';
import type { ResistedTemptation } from '../types/resistance';
// No unused imports

// The engine is called by stores when state changes happen (e.g. log expense).
// It evaluates conditions and awards XP/Achievements/Streaks.

export function evaluateTransaction(transaction: Transaction) {
  const progression = useProgressionStore.getState();
  const uid = useAuthStore.getState().uid;
  if (!uid) return;

  // 1. Give XP for logging
  useProgressionStore.getState().addXp(XP_AWARDS.LOG_EXPENSE);

  // 2. Evaluate Streaks
  useProgressionStore.getState().updateStreak('expenseLogging');
  if (transaction.category === 'food') {
    useProgressionStore.getState().updateStreak('homeFood');
  }

  // 3. Evaluate Quests
  evaluateQuestsForAction('log_expense', transaction, uid);

  // 4. Evaluate Achievements
  if (!progression.achievements.some((a) => a.id === 'ach_first_expense')) {
    useProgressionStore.getState().unlockAchievement('ach_first_expense');
    useProgressionStore.getState().addXp(ACHIEVEMENTS.find(a => a.id === 'ach_first_expense')?.xpReward || 0);
  }
}

export function evaluateRegretUpdate(_transactionId: string, status: RegretStatus) {
  const progression = useProgressionStore.getState();
  if (status === 'instant_regret') {
    if (!progression.achievements.some((a) => a.id === 'ach_regret')) {
      useProgressionStore.getState().unlockAchievement('ach_regret');
      useProgressionStore.getState().addXp(ACHIEVEMENTS.find(a => a.id === 'ach_regret')?.xpReward || 0);
    }
  }
}

export function evaluateResistance(temptation: ResistedTemptation) {
  const progression = useProgressionStore.getState();
  const uid = useAuthStore.getState().uid;
  if (!uid) return;

  // 1. Give XP
  useProgressionStore.getState().addXp(XP_AWARDS.LOG_RESISTANCE);

  // 2. Streaks
  useProgressionStore.getState().updateStreak('resistance');

  // 3. Quests
  evaluateQuestsForAction('log_resistance', temptation, uid);

  // 4. Achievements
  if (!progression.achievements.some((a) => a.id === 'ach_first_resist')) {
    useProgressionStore.getState().unlockAchievement('ach_first_resist');
    useProgressionStore.getState().addXp(ACHIEVEMENTS.find(a => a.id === 'ach_first_resist')?.xpReward || 0);
  }
}

// Internal helper for evaluating daily quests against an action
function evaluateQuestsForAction(
  actionType: string,
  payload: any,
  uid: string
) {
  const today = getTodayDateString();
  const activeQuests = generateDailyQuests(uid, today);
  const progState = useProgressionStore.getState();

  // If new day, check perfect day from yesterday? Complex for purely client side, skip perfect day for now, or just evaluate if all 3 completed.

  activeQuests.forEach((quest) => {
    if (progState.quests.date === today && progState.quests.completedIds.includes(quest.id)) {
      return; // Already done
    }

    let isCompleted = false;

    if (quest.type === actionType) {
      if (quest.type === 'log_expense') {
        const tx = payload as Transaction;
        if (!quest.targetCategory || quest.targetCategory === tx.category) {
          isCompleted = true;
        }
      } else if (quest.type === 'log_resistance') {
        isCompleted = true;
      } else if (quest.type === 'stay_above_danger') {
        const wallet = useWalletStore.getState();
        // Checked on any log expense, if balance still above threshold, it's completed (simplification).
        if (wallet.currentBalance > wallet.dangerZoneThreshold) {
          isCompleted = true;
        }
      } else if (quest.type === 'spend_under_amount') {
        // Technically this is a daily goal, but let's complete it immediately if the first transaction is small.
        // For simplicity, we just mark it complete if the transaction is under target.
        const tx = payload as Transaction;
        if (quest.targetValue && tx.amount < quest.targetValue) {
           isCompleted = true;
        }
      }
    }

    if (isCompleted) {
      useProgressionStore.getState().completeQuest(quest.id);
      useProgressionStore.getState().addXp(quest.xpReward);
      
      // Check perfect day
      const updatedState = useProgressionStore.getState();
      if (updatedState.quests.completedIds.length === 3) {
        useProgressionStore.getState().addXp(XP_AWARDS.PERFECT_DAY);
      }
    }
  });
}
