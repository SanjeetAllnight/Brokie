import { useWalletStore } from '../store/useWalletStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useResistanceStore } from '../store/useResistanceStore';
import { useProgressionStore } from '../store/useProgressionStore';

export default function DeveloperSettings() {
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleResetWallet = () => {
    // Basic local reset, Firebase sync will catch it if we had a dedicated action,
    // but we can just reset local state for now.
    // To do this cleanly, the stores should probably have a reset method, but we can patch them.
    useWalletStore.setState({ currentBalance: 0, todaySpend: 0 });
    alert("Wallet reset locally.");
  };

  const handleResetAllData = () => {
    if (confirm("Reset ALL data? This clears local state.")) {
       useWalletStore.setState({ currentBalance: 0, todaySpend: 0 });
       useTransactionStore.setState({ transactions: [] });
       useResistanceStore.setState({ temptations: [] });
       useProgressionStore.setState({ xp: 0, streaks: {}, quests: { date: '', completedIds: [] }, achievements: [] });
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-DEFAULT p-card-inner shadow-[0px_8px_24px_rgba(75,59,124,0.08)] border border-error-container relative overflow-hidden mt-8">
      <div className="absolute inset-0 bg-error-container/10 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined">bug_report</span>
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] leading-[28px] font-bold text-error">Developer Tools</h3>
            <p className="font-body-md text-sm text-on-surface-variant">Visible in development mode only.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={handleResetWallet} className="py-2 px-4 rounded border border-surface-variant text-sm font-label-caps hover:bg-surface-container transition-colors">
            Reset Wallet
          </button>
          <button onClick={() => alert('Not implemented')} className="py-2 px-4 rounded border border-surface-variant text-sm font-label-caps hover:bg-surface-container transition-colors">
            Seed Transactions
          </button>
          <button onClick={() => alert('Not implemented')} className="py-2 px-4 rounded border border-surface-variant text-sm font-label-caps hover:bg-surface-container transition-colors">
            Clear Firestore
          </button>
          <button onClick={() => alert('Not implemented')} className="py-2 px-4 rounded border border-surface-variant text-sm font-label-caps hover:bg-surface-container transition-colors">
            Reset Progression
          </button>
        </div>
        
        <div className="mt-4">
          <button onClick={handleResetAllData} className="w-full py-3 rounded-lg border-2 border-error text-error font-body-lg font-bold hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">delete_forever</span>
            Local Reset All Data
          </button>
        </div>
      </div>
    </section>
  );
}
