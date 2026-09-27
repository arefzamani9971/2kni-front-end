'use client';
import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

/** Online/offline; final commands are disabled while offline (F28). */
export const useOnlineStatus = (): boolean =>
  useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
