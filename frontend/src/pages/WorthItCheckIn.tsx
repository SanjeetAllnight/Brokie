import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactionStore } from '../store/useTransactionStore';
import { getRoastMessage } from '../lib/roastEngine';
import { useCurrency, CURRENCIES } from '../lib/currencyFormat';
import { useResistanceStore } from '../store/useResistanceStore';
import type { RegretStatus } from '../types/transaction';
import { CATEGORIES } from '../types/transaction';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePositiveAmount(raw: string): number {
  const n = parseFloat(raw);
  return isNaN(n) || n <= 0 ? 0 : n;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorthItCheckIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount = 0, transactionId } = (location.state as any) || {};
  const { format, currencyCode } = useCurrency();

  // Transaction store
  const pendingRegretId = useTransactionStore((state) => state.pendingRegretId);
  const setRegret       = useTransactionStore((state) => state.setRegret);
  const transactions    = useTransactionStore((state) => state.transactions);
  const logTemptation   = useResistanceStore((state) => state.logTemptation);

  // Find the pending transaction for the confirmation banner
  const pendingTx = (pendingRegretId || transactionId)
    ? transactions.find((t) => t.id === (pendingRegretId || transactionId)) ?? null
    : null;

  const categoryLabel = pendingTx
    ? (CATEGORIES.find((c) => c.id === pendingTx.category)?.label ?? pendingTx.category)
    : null;

  // Resisted temptation form state
  const [showResist, setShowResist]       = useState(false);
  const [itemName, setItemName]           = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [resistError, setResistError]     = useState<string | null>(null);
  const [isSubmittingResist, setIsSubmittingResist] = useState(false);

  // ─── Regret handler ──────────────────────────────────────────────────────

  const handleRegret = (status: RegretStatus) => {
    const id = pendingRegretId || transactionId;
    if (id) {
      setRegret(id, status);
    }
    navigate('/');
  };

  // ─── Resistance handler ──────────────────────────────────────────────────

  const handleLogResistance = () => {
    const trimmedName = itemName.trim();
    const amount = parsePositiveAmount(estimatedCost);

    if (!trimmedName) {
      setResistError('Please tell us what you resisted.');
      return;
    }
    if (amount <= 0) {
      setResistError('Please enter an estimated amount greater than zero.');
      return;
    }
    if (isSubmittingResist) return; // Prevent duplicate submissions

    setIsSubmittingResist(true);
    logTemptation(trimmedName, amount);

    // Reset & close the resistance panel, then go home
    setItemName('');
    setEstimatedCost('');
    setResistError(null);
    setIsSubmittingResist(false);
    navigate('/');
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-screen bg-background flex justify-center text-on-background selection:bg-primary-container selection:text-on-primary-container z-[60] absolute top-0 left-0 pt-12 pb-24 px-container-padding overflow-y-auto">
      <main className="w-full max-w-md flex flex-col gap-8 relative z-10">

        {/* Header */}
        <header className="w-full top-0 bg-transparent flex items-center justify-between py-base mb-4">
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Brokie</h1>
          {/* Close only allowed if there's no pending regret — enforces completion */}
          {!pendingRegretId && !transactionId && (
            <button
              onClick={() => navigate('/')}
              aria-label="Close Check-in"
              className="text-on-surface-variant hover:opacity-80 transition-opacity duration-200"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </button>
          )}
        </header>

        {/* Success Banner — shows details of the just-logged expense */}
        {pendingTx && (
          <section className="bg-primary-container rounded-lg p-card-inner flex items-center gap-4 text-on-primary-container brokie-card shadow-lg" role="alert">
            <span className="material-symbols-outlined text-[32px] fill">check_circle</span>
            <div>
              <p className="font-body-md text-body-md opacity-90">Success!</p>
              <p className="font-headline-md text-headline-md font-bold tracking-tight">
                Logged {format(pendingTx.amount)} for {categoryLabel}
              </p>
            </div>
          </section>
        )}

        {/* Worth It? Section */}
        <section className="flex flex-col gap-stack-gap mt-4">
          <div className="flex flex-col items-center justify-center pt-8 pb-4">
            <p className="font-headline-md text-headline-md text-on-surface text-center mb-1">
              {getRoastMessage('expense')}
            </p>
            <div className="font-display-lg text-[64px] leading-[72px] tracking-tight font-bold text-error">
              -{format(amount, { showCode: false })}
            </div>
            <h1 className="font-headline-lg text-[32px] leading-[40px] text-on-surface font-bold mt-6 mb-2">Worth it?</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Be honest. Your future self is watching.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRegret('worth_it')}
              className="brokie-card bg-surface-container-lowest rounded-lg p-6 flex flex-col items-center justify-center gap-4 border-2 border-transparent hover:border-primary transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                😌
              </div>
              <span className="font-body-lg text-body-lg font-bold text-center">Worth it</span>
            </button>

            <button
              onClick={() => handleRegret('instant_regret')}
              className="brokie-card bg-surface-container-lowest rounded-lg p-6 flex flex-col items-center justify-center gap-4 border-2 border-transparent hover:border-error transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                😬
              </div>
              <span className="font-body-lg text-body-lg font-bold text-center">Instant regret</span>
            </button>
          </div>
        </section>

        <hr className="border-outline-variant my-4" />

        {/* Resisted Temptation Section */}
        <section className="flex flex-col gap-4">
          <button
            className={`flex items-center justify-center gap-2 text-secondary font-body-lg text-body-lg hover:opacity-80 transition-opacity p-4 rounded-lg border-2 border-secondary border-dashed ${showResist ? 'bg-secondary/10' : ''}`}
            onClick={() => setShowResist(!showResist)}
          >
            <span>😤</span>
            <span>Log a resisted temptation instead</span>
          </button>

          {showResist && (
            <div className="bg-surface-container-lowest p-card-inner rounded-lg brokie-card flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary fill">shield</span>
                <h3 className="font-body-lg text-body-lg font-bold text-on-surface">Dodged a Bullet</h3>
              </div>

              {/* Validation error */}
              {resistError && (
                <div className="px-3 py-2 bg-error-container text-on-error-container rounded-lg font-body-md text-body-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {resistError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="item-name">
                  What did you resist?
                </label>
                <input
                  className="brokie-input bg-surface-container-low border-none rounded-lg p-4 font-body-md text-body-md w-full focus:ring-0"
                  id="item-name"
                  placeholder="e.g. Avocado Toast"
                  type="text"
                  value={itemName}
                  onChange={(e) => { setItemName(e.target.value); setResistError(null); }}
                  maxLength={80}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="est-cost">
                  Estimated Savings ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline-md text-headline-md text-on-surface-variant">
                    {CURRENCIES.find(c => c.code === currencyCode)?.symbol || '$'}
                  </span>
                  <input
                    className="brokie-input bg-surface-container-low border-none rounded-lg p-4 pl-8 font-display-currency text-display-currency w-full focus:ring-0 h-16"
                    id="est-cost"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => { setEstimatedCost(e.target.value); setResistError(null); }}
                  />
                </div>
              </div>

              <button
                onClick={handleLogResistance}
                disabled={isSubmittingResist}
                className={`w-full font-body-lg text-body-lg font-bold py-4 rounded-full mt-2 transition-opacity ${
                  isSubmittingResist
                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                    : 'bg-secondary text-on-secondary hover:opacity-90'
                }`}
              >
                {isSubmittingResist ? 'Saving...' : 'Bank these savings'}
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
