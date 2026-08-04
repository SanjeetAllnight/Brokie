import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../store/useTransactionStore';
import { useResistanceStore } from '../store/useResistanceStore';
import { useWalletStore } from '../store/useWalletStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProfileStore } from '../store/useProfileStore';
import { generateMonthlyWrap } from '../wrap/wrapGenerator';
import { generateStoryPages } from '../wrap/storyTeller';
import { useDashboardStats } from '../statistics/useStatistics';

export default function MonthlyWrap() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const transactions = useTransactionStore(s => s.transactions);
  const monthlyTransactions = useTransactionStore(s => s.getMonthTransactions());
  const temptations = useResistanceStore(s => s.temptations);
  const { currentBalance } = useWalletStore();
  const { walletHP } = useDashboardStats();
  const roastIntensity = useSettingsStore(s => s.roastIntensity);
  const currencyCode = useProfileStore(s => s.currency);

  const pages = useMemo(() => {
    const data = generateMonthlyWrap(
      monthlyTransactions,
      transactions,
      temptations,
      currentBalance,
      walletHP
    );
    return generateStoryPages(data, roastIntensity, currencyCode);
  }, [monthlyTransactions, transactions, temptations, currentBalance, walletHP, roastIntensity, currencyCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  const next = () => {
    if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
    else navigate('/');
  };

  const prev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  if (pages.length === 0) return null;

  const page = pages[currentPage];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-fade-in touch-pan-x"
         onTouchStart={(e) => {
           const touchDown = e.touches[0].clientX;
           e.currentTarget.dataset.touchDown = touchDown.toString();
         }}
         onTouchEnd={(e) => {
           const touchDown = parseFloat(e.currentTarget.dataset.touchDown || '0');
           if (!touchDown) return;
           const touchUp = e.changedTouches[0].clientX;
           const diff = touchDown - touchUp;
           if (diff > 50) next();
           else if (diff < -50) prev();
         }}
    >
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {pages.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-surface-variant/30 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-primary transition-all duration-300 ${i < currentPage ? 'w-full' : i === currentPage ? 'w-full animate-pulse' : 'w-0'}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 right-6 w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center z-10 hover:bg-surface-container-highest transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface">close</span>
      </button>

      {/* Content */}
      <div 
        key={currentPage} 
        className="flex flex-col items-center text-center px-8 w-full max-w-lg animate-slide-up-fade"
      >
        <div className="text-[120px] leading-none mb-8 animate-bounce-subtle">
          {page.emoji}
        </div>
        
        <h1 className="font-headline-lg text-4xl font-bold text-on-surface mb-6 tracking-tight">
          {page.title}
        </h1>
        
        <p className="font-body-lg text-xl text-on-surface-variant leading-relaxed">
          {page.body}
        </p>

        {page.highlight && (
          <div className="mt-12 inline-block bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-headline-md text-2xl font-bold">
            {page.highlight}
          </div>
        )}
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 flex gap-4 w-full justify-between px-8 max-w-lg">
        <button 
          onClick={prev}
          className={`w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="material-symbols-outlined text-on-surface">chevron_left</span>
        </button>
        <button 
          onClick={next}
          className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined">{currentPage === pages.length - 1 ? 'home' : 'chevron_right'}</span>
        </button>
      </div>
      
      {/* Click zones for desktop */}
      <div className="absolute inset-y-16 left-0 w-1/3 z-0 cursor-pointer hidden md:block" onClick={prev}></div>
      <div className="absolute inset-y-16 right-0 w-2/3 z-0 cursor-pointer hidden md:block" onClick={next}></div>
    </div>
  );
}
