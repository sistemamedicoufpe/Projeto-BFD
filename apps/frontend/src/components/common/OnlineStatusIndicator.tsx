import { useEffect, useState, useRef, useCallback } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { syncService } from '../../services/sync/sync.service';

export function OnlineStatusIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<{
    pendingItems: number;
    lastSync: string | null;
    isSyncing: boolean;
  }>({
    pendingItems: 0,
    lastSync: null,
    isSyncing: false,
  });
  const [showBanner, setShowBanner] = useState(false);
  const prevOnlineRef = useRef(isOnline);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBannerVisibility = useCallback(() => {
    // Show banner when going offline or coming back online
    if (!isOnline || wasOffline) {
      setShowBanner(true);

      // Auto-hide after 5 seconds when online
      if (isOnline && wasOffline) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowBanner(false), 5000);
      }
    }
  }, [isOnline, wasOffline]);

  useEffect(() => {
    // Only trigger when online status changes
    if (prevOnlineRef.current !== isOnline) {
      prevOnlineRef.current = isOnline;
      handleBannerVisibility();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOnline, handleBannerVisibility]);

  useEffect(() => {
    // Update sync status
    const updateSyncStatus = async () => {
      const status = await syncService.getSyncStatus();
      setSyncStatus({
        pendingItems: status.pendingItems,
        lastSync: status.lastSync,
        isSyncing: status.isSyncing,
      });
    };

    updateSyncStatus();

    // Update every 10 seconds
    const interval = setInterval(updateSyncStatus, 10000);

    // Listen for sync completion
    const handleSyncComplete = () => {
      updateSyncStatus();
    };

    window.addEventListener('connection-restored', updateSyncStatus);
    window.addEventListener('sw-sync-request', updateSyncStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('connection-restored', handleSyncComplete);
      window.removeEventListener('sw-sync-request', handleSyncComplete);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline ? (
        // Offline banner
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
              <div>
                <p className="font-semibold">Você está offline</p>
                <p className="text-sm opacity-90">
                  Suas alterações serão sincronizadas quando a conexão for restaurada
                </p>
              </div>
            </div>
            {syncStatus.pendingItems > 0 && (
              <div className="bg-red-700 px-3 py-1 rounded-full text-sm font-medium">
                {syncStatus.pendingItems} {syncStatus.pendingItems === 1 ? 'item' : 'itens'} pendentes
              </div>
            )}
          </div>
        </div>
      ) : wasOffline ? (
        // Back online banner
        <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold">Conexão restaurada</p>
                {syncStatus.isSyncing ? (
                  <p className="text-sm opacity-90">Sincronizando dados...</p>
                ) : syncStatus.pendingItems > 0 ? (
                  <p className="text-sm opacity-90">
                    Sincronizando {syncStatus.pendingItems} {syncStatus.pendingItems === 1 ? 'item' : 'itens'}...
                  </p>
                ) : (
                  <p className="text-sm opacity-90">Todos os dados estão sincronizados</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-green-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
