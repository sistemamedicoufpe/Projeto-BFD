import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
  });

  const handleMessage = useCallback((event: MessageEvent) => {
    console.log('Message from service worker:', event.data);

    if (event.data && event.data.type === 'SYNC_REQUEST') {
      // Trigger sync in the app
      window.dispatchEvent(new CustomEvent('sw-sync-request'));
    }
  }, []);

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      console.log('Service Worker registered:', registration);

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setState((prev) => ({
                ...prev,
                isUpdateAvailable: true,
              }));

              console.log('New service worker available');
            }
          });
        }
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }, []);

  useEffect(() => {
    if (!state.isSupported) {
      console.log('Service Workers are not supported');
      return;
    }

    registerServiceWorker();

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [state.isSupported, registerServiceWorker, handleMessage]);

  const updateServiceWorker = () => {
    if (state.registration && state.registration.waiting) {
      // Tell the waiting service worker to skip waiting
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page to use the new service worker
      window.location.reload();
    }
  };

  const unregisterServiceWorker = async () => {
    if (state.registration) {
      await state.registration.unregister();
      setState((prev) => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
      console.log('Service Worker unregistered');
    }
  };

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}
