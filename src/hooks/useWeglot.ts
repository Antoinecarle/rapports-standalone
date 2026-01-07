import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Weglot: {
      initialize: (config: { api_key: string; hide_switcher?: boolean }) => void;
      switchTo: (lang: string) => void;
      on: (event: string, callback: () => void) => void;
      getCurrentLang: () => string;
    };
  }
}

export function useWeglot() {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    
    // Get lang from URL
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'fr';
    
    // Wait for Weglot to be available
    const initWeglot = () => {
      if (typeof window.Weglot === 'undefined') {
        // Retry after a short delay
        setTimeout(initWeglot, 100);
        return;
      }
      
      initialized.current = true;
      
      window.Weglot.initialize({
        api_key: 'wg_594771a5b0a8318b805497f9f42ce2c87',
        hide_switcher: true
      });
      
      // Switch to the requested language after initialization
      if (lang !== 'fr') {
        window.Weglot.on('initialized', () => {
          window.Weglot.switchTo(lang);
        });
      }
      
      console.log('[Weglot] Initialized with lang:', lang);
    };
    
    // Small delay to ensure React content is rendered
    setTimeout(initWeglot, 500);
  }, []);
}

