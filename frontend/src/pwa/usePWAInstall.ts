// usePWAInstall — React hook for managing PWA install prompts.
// Supports Android (native BeforeInstallPromptEvent) and iOS (manual instructions).

import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'brokie_install_dismissed';

interface UsePWAInstallReturn {
  canInstall:    boolean;  // Android: native prompt available
  isInstalled:   boolean;  // Already running as PWA
  isIOS:         boolean;  // iOS Safari — requires manual instructions
  isDismissed:   boolean;  // User dismissed the prompt
  promptInstall: () => Promise<void>;
  dismiss:       () => void;
}

// BeforeInstallPromptEvent is not in standard TypeScript lib yet
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function detectIsIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function detectIsInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled]       = useState(detectIsInStandaloneMode);
  const [isDismissed, setIsDismissed]       = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  );

  const isIOS = detectIsIOS();

  // Capture the browser's install prompt event (Android Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for the app being installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  }, []);

  const canInstall = !isInstalled && !!deferredPrompt;

  return { canInstall, isInstalled, isIOS, isDismissed, promptInstall, dismiss };
}
