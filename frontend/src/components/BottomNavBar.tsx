import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-lowest dark:bg-inverse-surface shadow-[0px_-8px_24px_rgba(75,59,124,0.08)] rounded-t-lg md:hidden">
      <Link to="/" className={`flex flex-col items-center justify-center transition-transform duration-150 active:scale-95 ${path === '/' ? 'text-primary dark:text-primary-fixed-dim font-bold scale-110' : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container'}`}>
        <span className={`material-symbols-outlined text-[28px] ${path === '/' ? 'fill' : ''}`}>home</span>
        <span className="font-label-caps text-label-caps mt-1">Home</span>
      </Link>
      
      <Link to="/stats" className={`flex flex-col items-center justify-center transition-transform duration-150 active:scale-95 ${path === '/stats' ? 'text-primary dark:text-primary-fixed-dim font-bold scale-110' : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container'}`}>
        <span className={`material-symbols-outlined text-[24px] ${path === '/stats' ? 'fill' : ''}`}>leaderboard</span>
        <span className="font-label-caps text-label-caps mt-1">Stats</span>
      </Link>

      <div className="relative -top-6">
        <Link to="/log-expense" className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-transform duration-150 border-4 border-surface-container-lowest">
          <span className="material-symbols-outlined text-[32px]">add_circle</span>
        </Link>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-on-surface-variant whitespace-nowrap">Add</span>
      </div>

      <Link to="/settings" className={`flex flex-col items-center justify-center transition-transform duration-150 active:scale-95 ${path === '/settings' ? 'text-primary dark:text-primary-fixed-dim font-bold scale-110' : 'text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container'}`}>
        <span className={`material-symbols-outlined text-[24px] ${path === '/settings' ? 'fill' : ''}`}>settings</span>
        <span className="font-label-caps text-label-caps mt-1">Settings</span>
      </Link>

      <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container transition-colors active:scale-95 transition-transform duration-150">
        <span className="material-symbols-outlined text-[24px]">shield</span>
        <span className="font-label-caps text-label-caps mt-1">Vault</span>
      </button>
    </nav>
  );
}
