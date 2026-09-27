'use client';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

type ToastTone = 'neutral' | 'success' | 'danger';
type ToastItem = { id: number; message: ReactNode; tone: ToastTone };

const ToastContext = createContext<((message: ReactNode, tone?: ToastTone) => void) | null>(null);

/** Short confirmations only; persistent problems (e.g. unknown cost) stay on the page, not in a toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((message: ReactNode, tone: ToastTone = 'neutral') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, message, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex max-w-[440px] animate-fade-in items-center gap-2 rounded-md px-4 py-3 text-body-m shadow-medium',
              t.tone === 'neutral' && 'bg-fg-primary text-fg-inverse',
              t.tone === 'success' && 'bg-success text-fg-inverse',
              t.tone === 'danger' && 'bg-danger text-fg-inverse',
            )}
          >
            {t.tone === 'success' ? <Icon name="check-circle" size={20} /> : null}
            {t.tone === 'danger' ? <Icon name="alert-danger" size={20} /> : null}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('ToastProvider is missing.');
  return show;
}
