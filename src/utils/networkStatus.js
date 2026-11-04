// ============================================================
// Hook personalizado para detectar estado de la red
// ============================================================

import { useState, useEffect } from 'react';

/**
 * Hook que devuelve el estado actual de la conexión a internet.
 * @returns {boolean} true si hay conexión, false si está offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[Red] Conexión recuperada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Red] Sin conexión');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
