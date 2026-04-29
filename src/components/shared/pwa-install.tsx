'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setShowIOSPrompt(true);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissIOSPrompt = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  if (showBanner) {
    return (
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Install MemberHub</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add to your home screen for quick access
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall}>
                    Install
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBanner(false)}
                  >
                    Later
                  </Button>
                </div>
              </div>
              <button onClick={() => setShowBanner(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isIOS && showIOSPrompt) {
    return (
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Install MemberHub</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap the share button{' '}
                  <span className="inline-block">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                      <polyline points="16,6 12,2 8,6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </span>{' '}
                  then &quot;Add to Home Screen&quot;
                </p>
              </div>
              <button onClick={dismissIOSPrompt}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
