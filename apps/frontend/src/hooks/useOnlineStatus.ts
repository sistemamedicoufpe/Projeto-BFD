import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Clear the "was offline" flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('connection-restored'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('connection-lost'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
