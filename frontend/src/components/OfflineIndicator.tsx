// OfflineIndicator — subtle, non-blocking offline/online status indicator.
// Watches navigator.onLine and shows a discreet top bar when offline.

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack]     = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBack(true);
        // Show "back online" briefly then hide
        setTimeout(() => {
          setShowBack(false);
          setWasOffline(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showBack) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-label-caps transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-500/90 text-white'
          : 'bg-surface-container text-on-surface-variant border-b border-outline-variant'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[14px]">
        {isOnline ? 'wifi' : 'wifi_off'}
      </span>
      <span>
        {isOnline
          ? 'Back online — syncing changes…'
          : 'Offline — changes will sync when reconnected'}
      </span>
    </div>
  );
}
