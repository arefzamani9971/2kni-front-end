'use client';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { cn } from '../lib/cn';

import type { ShowToast, ToastItem } from './Toast.types';
import { AUTO_HIDE_MS, STATUS_OF } from './Toast.constants';
import { ToastContext } from './toast-context';
import { ToastCard } from './ToastCard';

/**
 * Figma `Dukani/Toast` (635:539): surface card, radius md, padding spacing/4, gap spacing/3, status icon + Body/M
 * text + dismiss (48 mobile / 40 desktop). Placement is CSS-only (no strategy needed): mobile above the bottom
 * navigation with 16px margins, desktop in the top corner, 420 wide. Non-modal live region — `status` for
 * info/success, `alert` for errors. Errors persist and must also be shown at the affected field; a toast is never
 * the only place of an error.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const show = useCallback<ShowToast>(
    (message, tone = 'info', options) => {
      const id = ++seq.current;
      const status = STATUS_OF[tone];
      setItems((xs) => [...xs.slice(-2), { id, message, status }]);
      const duration = options?.duration ?? (status === 'error' ? undefined : AUTO_HIDE_MS);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );
  const value = useMemo(() => show, [show]);
  const polite = items.filter((t) => t.status !== 'error');
  const assertive = items.filter((t) => t.status === 'error');
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={cn(
          'pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2',
          'desktop:inset-x-auto desktop:end-6 desktop:top-6 desktop:bottom-auto desktop:items-stretch',
        )}
      >
        <div aria-live="polite" className="desktop:items-stretch flex w-full flex-col items-center gap-2">
          {polite.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
        <div aria-live="assertive" className="desktop:items-stretch flex w-full flex-col items-center gap-2">
          {assertive.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
