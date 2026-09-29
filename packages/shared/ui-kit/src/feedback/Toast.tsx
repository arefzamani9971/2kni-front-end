'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';

/** Figma `Toast` Status: Info / Success / Warning / Error. `neutral` and `danger` are kept as aliases. */
export type ToastTone = 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'danger';
type Status = 'info' | 'success' | 'warning' | 'error';

export type ToastOptions = {
  /** Errors persist until dismissed by default (Figma); others auto-hide after this many ms. */
  duration?: number;
};

type ToastItem = { id: number; message: ReactNode; status: Status };
type ShowToast = (message: ReactNode, tone?: ToastTone, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

const STATUS_OF: Record<ToastTone, Status> = {
  info: 'info',
  neutral: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  danger: 'error',
};

const STATUS_ICON: Record<Status, { icon: IconName; className: string }> = {
  info: { icon: 'info', className: 'text-info' },
  success: { icon: 'check-circle', className: 'text-success' },
  warning: { icon: 'alert-warning', className: 'text-warning' },
  error: { icon: 'alert-danger', className: 'text-danger' },
};

const AUTO_HIDE_MS = 4000;

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
        <div role="status" aria-live="polite" className="flex w-full flex-col items-center gap-2 desktop:items-stretch">
          {polite.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
        <div role="alert" aria-live="assertive" className="flex w-full flex-col items-center gap-2 desktop:items-stretch">
          {assertive.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const s = STATUS_ICON[item.status];
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-[420px] animate-fade-in items-center gap-3 rounded-md bg-surface py-2 ps-4 pe-2 text-body-m text-fg-primary shadow-medium',
        'desktop:w-[420px]',
      )}
    >
      <Icon name={s.icon} size={24} className={cn('shrink-0', s.className)} />
      <p className="min-w-0 flex-1">{item.message}</p>
      <IconButton icon="close" label="بستن پیام" size={20} className="size-12 desktop:size-10" onClick={() => onDismiss(item.id)} />
    </div>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error('ToastProvider is missing.');
  return show;
}
