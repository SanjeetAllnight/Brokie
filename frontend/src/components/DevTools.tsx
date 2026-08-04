import { useState } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useResistanceStore } from '../store/useResistanceStore';

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);

  const increaseWallet    = useWalletStore((state) => state.increaseWallet);
  const decreaseWallet    = useWalletStore((state) => state.decreaseWallet);
  const resetWallet       = useWalletStore((state) => state.resetWallet);
  const currentBalance    = useWalletStore((state) => state.currentBalance);
  const clearTransactions = useTransactionStore((state) => state.clearTransactions);
  const transactions      = useTransactionStore((state) => state.transactions);
  const clearTemptations  = useResistanceStore((state) => state.clearTemptations);
  const temptations       = useResistanceStore((state) => state.temptations);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 bg-error text-on-error w-10 h-10 rounded-full shadow-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
        title="Open Dev Tools"
      >
        <span className="material-symbols-outlined">bug_report</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-surface-container-high p-4 rounded-lg shadow-2xl border border-error w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">bug_report</span>
          Dev Tools
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-sm text-on-surface-variant">
          Balance: <span className="font-bold text-on-surface">${currentBalance.toFixed(2)}</span>
        </div>
        <div className="text-sm text-on-surface-variant">
          Transactions: <span className="font-bold text-on-surface">{transactions.length}</span>
        </div>
        <div className="text-sm text-on-surface-variant mb-2">
          Resisted: <span className="font-bold text-on-surface">{temptations.length}</span>
        </div>

        <button
          onClick={() => increaseWallet(100)}
          className="bg-primary text-on-primary py-2 rounded font-bold text-sm hover:opacity-90"
        >
          + $100
        </button>
        <button
          onClick={() => decreaseWallet(100)}
          className="bg-secondary text-on-secondary py-2 rounded font-bold text-sm hover:opacity-90"
        >
          - $100
        </button>

        <hr className="border-outline-variant my-1" />

        <button
          onClick={() => clearTransactions()}
          className="bg-surface-container-highest text-on-surface py-2 rounded font-bold text-sm hover:opacity-90 border border-outline-variant"
        >
          Clear Transactions
        </button>
        <button
          onClick={() => clearTemptations()}
          className="bg-surface-container-highest text-on-surface py-2 rounded font-bold text-sm hover:opacity-90 border border-outline-variant"
        >
          Clear Temptations
        </button>
        <button
          onClick={() => resetWallet()}
          className="bg-error text-on-error py-2 rounded font-bold text-sm hover:opacity-90"
        >
          Reset Wallet
        </button>
      </div>
    </div>
  );
}
