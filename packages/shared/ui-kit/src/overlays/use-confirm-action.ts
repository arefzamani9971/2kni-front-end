'use client';
import { appError, isAppError, type AppError } from '@dukani/domain';
import { useCallback, useRef, useState } from 'react';
import type { ConfirmAction } from './confirm-action.types';

/**
 * Confirm → run → close for destructive or irreversible commands (PAT-DELETE-01, PAT-MODAL-01). Runs once per
 * confirm (a second click while busy does nothing), keeps the dialog open with the error on failure, and does not
 * close while the command runs (closing would not cancel it on the server).
 *
 * ```tsx
 * const archive = useConfirmAction((product: Product) => products.archive(product.id));
 * <Button onClick={() => archive.open(product)}>{t('archive')}</Button>
 * <ConfirmDialog {...archive.dialog} destructive title={t('archiveTitle', { name: archive.target?.title })}
 *   confirmLabel={t('archive')}>{archive.error ? <Alert tone="danger" title={message(archive.error)} /> : null}
 * </ConfirmDialog>
 * ```
 */
export function useConfirmAction<T = void>(run: (target: T) => Promise<unknown>): ConfirmAction<T> {
  const [target, setTarget] = useState<{ readonly value: T } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const running = useRef(false);
  const open = useCallback((value: T) => {
    if (running.current) return;
    setError(null);
    setTarget({ value });
  }, []);
  const confirm = async () => {
    if (!target || running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      await run(target.value);
      setTarget(null);
    } catch (caught) {
      setError(isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', String(caught)));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  return {
    open,
    target: target?.value,
    error,
    dialog: {
      open: target !== null,
      onOpenChange: (next) => {
        if (!next && !running.current) setTarget(null);
      },
      loading: busy,
      onConfirm: () => void confirm(),
    },
  };
}
