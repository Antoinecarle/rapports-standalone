import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Weglot: {
      initialize: (config: { api_key: string; hide_switcher?: boolean }) => void;
      switchTo: (lang: string) => void;
      on: (event: string, callback: () => void) => void;
      getCurrentLang: () => string;
      initialized: boolean;
    };
  }
}

// Get lang from URL - do this once at module level
const urlParams = new URLSearchParams(window.location.search);
const targetLang = urlParams.get('lang') || 'fr';

export function useWeglot() {
  const initialized = useRef(false);
  const switched = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;

    // Wait for Weglot to be available
    const initWeglot = () => {
      if (typeof window.Weglot === 'undefined') {
        console.log('[Weglot] Waiting for Weglot script...');
        setTimeout(initWeglot, 100);
        return;
      }

      // Check if already initialized by another instance
      if (window.Weglot.initialized) {
        console.log('[Weglot] Already initialized, switching to:', targetLang);
        initialized.current = true;
        if (targetLang !== 'fr' && !switched.current) {
          switched.current = true;
          window.Weglot.switchTo(targetLang);
        }
        return;
      }

      initialized.current = true;
      console.log('[Weglot] Initializing with lang:', targetLang);

      window.Weglot.initialize({
        api_key: 'wg_594771a5b0a8318b805497f9f42ce2c87',
        hide_switcher: true
      });

      // Switch to the requested language after initialization
      window.Weglot.on('initialized', () => {
        console.log('[Weglot] Weglot initialized event fired');
        if (targetLang !== 'fr' && !switched.current) {
          switched.current = true;
          console.log('[Weglot] Switching to:', targetLang);
          window.Weglot.switchTo(targetLang);
        }
      });
    };

    // Delay to ensure React content is rendered
    setTimeout(initWeglot, 1000);
  }, []);

  return { lang: targetLang };
}

