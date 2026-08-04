// SyncProvider — mounts Firebase sync and renders loading/error fallbacks.
// This is the only component that knows about Firebase state.
// The rest of the app is completely unaware of authentication.

import type { ReactNode } from 'react';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  children: ReactNode;
}

export default function SyncProvider({ children }: Props) {
  useFirebaseSync();

  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const authError     = useAuthStore((s) => s.authError);

  // ─── Loading state ───────────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="w-full h-screen bg-background flex flex-col items-center justify-center gap-4 text-on-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="font-body-md text-body-md text-on-surface-variant">Loading your wallet…</p>
      </div>
    );
  }

  // ─── Auth error state ────────────────────────────────────────────────────
  if (authError) {
    return (
      <div className="w-full h-screen bg-background flex flex-col items-center justify-center gap-6 px-container-padding text-on-background">
        <div className="bg-error-container text-on-error-container rounded-lg p-card-inner brokie-card w-full max-w-sm flex flex-col gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px]">wifi_off</span>
            <div>
              <p className="font-headline-md text-headline-md font-bold">Connection issue</p>
              <p className="font-body-md text-body-md opacity-80">{authError}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-error text-on-error font-body-lg text-body-lg font-bold py-3 rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
          The app may still work offline with cached data.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
