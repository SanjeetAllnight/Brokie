import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/useWalletStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { CATEGORIES } from '../types/transaction';
import type { ExpenseCategory } from '../types/transaction';
import { useCurrency, CURRENCIES } from '../lib/currencyFormat';

// ─── Keypad logic ────────────────────────────────────────────────────────────

/** Appends a digit or decimal point to the current raw string.
 *  Enforces max 2 decimal places and prevents leading zeros. */
function applyKeypadInput(current: string, key: string): string {
  if (key === '.') {
    // Allow only one decimal point
    if (current.includes('.')) return current;
    return current === '' ? '0.' : current + '.';
  }

  // Limit to 2 decimal places
  const dotIndex = current.indexOf('.');
  if (dotIndex !== -1 && current.length - dotIndex > 2) return current;

  // Replace leading zero (e.g. "0" + "5" → "5")
  if (current === '0') return key;

  return current + key;
}

function applyBackspace(current: string): string {
  return current.length <= 1 ? '' : current.slice(0, -1);
}

function parseAmount(raw: string): number {
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LogExpense() {
  const navigate = useNavigate();

  // Local UI state
  const [rawAmount, setRawAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { currencyCode } = useCurrency();
  const currencySymbol = CURRENCIES.find(c => c.code === currencyCode)?.symbol || '$';

  // Zustand actions
  const decreaseWallet = useWalletStore((state) => state.decreaseWallet);
  const addTodaySpend  = useWalletStore((state) => state.addTodaySpend);
  const logExpense     = useTransactionStore((state) => state.logExpense);

  // Keypad handlers
  const handleKey = useCallback((key: string) => {
    setValidationError(null);
    setRawAmount((prev) => applyKeypadInput(prev, key));
  }, []);

  const handleBackspace = useCallback(() => {
    setRawAmount((prev) => applyBackspace(prev));
  }, []);

  const handleCategorySelect = (cat: ExpenseCategory) => {
    setSelectedCategory(cat);
    setValidationError(null);
  };

  // Display value — show "0.00" when nothing has been typed
  const displayAmount = rawAmount === '' ? '0.00' : rawAmount;

  // Submission
  const handleSubmit = () => {
    const amount = parseAmount(rawAmount);

    // Validation
    if (amount <= 0) {
      setValidationError('Please enter an amount greater than zero.');
      return;
    }
    if (!selectedCategory) {
      setValidationError('Please select a category.');
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submissions

    setIsSubmitting(true);

    // Persist to transaction store
    logExpense(amount, selectedCategory, note.trim());

    // Update wallet state immediately
    decreaseWallet(amount);
    addTodaySpend(amount);

    // Reset form and navigate to check-in
    setRawAmount('');
    setSelectedCategory(null);
    setNote('');
    setIsSubmitting(false);

    navigate('/worth-it');
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const amountIsSet = parseAmount(rawAmount) > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-24 h-[calc(100vh-80px)] w-full">
      <header className="flex items-center justify-between px-container-padding py-base w-full bg-background dark:bg-background z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest">
            <img className="w-full h-full object-cover" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG3IT7hHfXIw0ryZ2ZXJyMF7biRccp9Ki5TZU_enXRTjKqHAr2NoH3sXgiNc9L_LTqVSFl9JrrMTh7B5WNrFUfWrbaS1KVmJ0UeacczLgciSPsMHECjTbDp9uPhkQsniPcxfTCOizle8DtG2-5K9qY2rce05oWCqYz6LAoKemzvXxWnarKCR2ok4ZA_HU__3EEfUWlP1BpgQt8laIcuNI89dE7yGfTGvDeKlhwPkJ4P4gdubUdpKDhIg" />
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Brokie</h1>
        </div>
        <button className="hover:opacity-80 transition-opacity duration-200">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style={{ fontSize: '28px' }}>notifications</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto px-container-padding w-full h-full">
        {/* Amount Display */}
        <div className="flex flex-col items-center justify-center py-8 shrink-0">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">AMOUNT TO LOG</p>
          <div className={`flex items-start transition-colors ${amountIsSet ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="font-headline-md text-headline-md mt-2">{currencySymbol}</span>
            <span className="font-display-currency text-display-currency">{displayAmount}</span>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 shrink-0 px-4 py-3 bg-error-container text-on-error-container rounded-lg font-body-md text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {validationError}
          </div>
        )}

        {/* Category Selector */}
        <div className="mb-6 shrink-0 -mx-container-padding px-container-padding">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 px-1">CATEGORY</p>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center gap-2 group shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                    isSelected
                      ? 'bg-primary-fixed ring-2 ring-primary'
                      : 'bg-surface-container-high'
                  }`}>
                    <span className={`material-symbols-outlined text-[32px] ${isSelected ? 'text-on-primary-container fill' : 'text-on-surface-variant'}`}>
                      {cat.icon}
                    </span>
                  </div>
                  <span className={`font-label-caps text-label-caps ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-6 shrink-0">
          <input
            className="w-full bg-surface-container-low border-0 rounded-DEFAULT px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:bg-surface-container transition-all"
            placeholder="What did you buy now?"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
          />
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-6 mt-auto shrink-0">
          {['1','2','3','4','5','6','7','8','9','.','0'].map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`flex items-center justify-center font-headline-lg text-headline-lg text-on-surface h-16 w-full rounded-DEFAULT hover:bg-surface-container-highest transition-colors active:scale-95 ${key === '.' ? 'text-2xl font-bold' : ''}`}
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="flex items-center justify-center font-headline-lg text-headline-lg text-on-surface h-16 w-full rounded-DEFAULT hover:bg-surface-container-highest transition-colors active:scale-95 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[28px]">backspace</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full font-headline-md text-headline-md py-4 rounded-lg shadow-lg transition-all mb-4 shrink-0 ${
            isSubmitting
              ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
              : 'bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95'
          }`}
        >
          {isSubmitting ? 'Logging...' : 'Log it'}
        </button>
      </main>
    </div>
  );
}
