// InstallBanner — polished bottom-sheet install prompt.
// Shows on Android (native prompt) or iOS (manual instructions).
// Self-dismisses and persists dismissal to localStorage.

import { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

export default function InstallBanner() {
  const { canInstall, isInstalled, isIOS, isDismissed, promptInstall, dismiss } = usePWAInstall();
  const [showIOS, setShowIOS] = useState(false);

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed) return null;
  if (!canInstall && !isIOS) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOS(true);
    } else {
      await promptInstall();
    }
  };

  return (
    <>
      {/* Android / Generic install banner */}
      {!showIOS && (
        <div
          className="fixed bottom-[88px] left-4 right-4 z-50 bg-surface-container-lowest border border-primary/20 rounded-2xl shadow-[0_8px_32px_rgba(75,59,124,0.2)] p-4 flex items-center gap-4 animate-slide-up"
          role="banner"
          aria-label="Install Brokie"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl fill">download</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-lg text-on-surface font-bold text-sm">Install Brokie</p>
            <p className="font-body-md text-on-surface-variant text-xs">
              {isIOS ? 'Add to Home Screen for the full experience.' : 'Add to your home screen for offline access.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-primary text-on-primary font-label-caps text-xs px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions sheet */}
      {showIOS && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end" onClick={() => setShowIOS(false)}>
          <div
            className="w-full bg-surface-container-lowest rounded-t-3xl p-6 pb-10 flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="iOS installation instructions"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-on-surface font-bold">Install on iPhone</h2>
              <button onClick={() => { setShowIOS(false); dismiss(); }} className="text-on-surface-variant hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: 'ios_share', step: '1', text: 'Tap the Share button at the bottom of Safari.' },
                { icon: 'add_box', step: '2', text: 'Scroll down and tap "Add to Home Screen".' },
                { icon: 'check_circle', step: '3', text: 'Tap "Add" to confirm. Brokie will appear on your home screen.' },
              ].map(({ icon, step, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Step {step}</span>
                    <p className="font-body-md text-on-surface">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
