'use client';
import { appError, isAppError, parseBarcode, type AppError } from '@dukani/domain';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ScanIntake, ScanIntakeOptions, ScanIntakeStatus, ScanSource } from './scan-intake.types';
import { useBarcodeCamera } from './use-barcode-camera';
import { useHardwareScanner } from './use-hardware-scanner';

type IntakeState = {
  readonly status: ScanIntakeStatus;
  readonly code: string | null;
  readonly error: AppError | null;
};

/**
 * One way in for every barcode on a screen (PAT-SCAN-01): hardware scanner, camera and manual entry are validated
 * the same way and resolved one at a time in scan order, so three quick scans in a sale give three results in the
 * right order and a slow lookup never overtakes a later one. Late answers after unmount or a store change are dropped.
 */
export function useScanIntake<R>(options: ScanIntakeOptions<R>): ScanIntake {
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });
  const [state, setState] = useState<IntakeState>({ status: 'idle', code: null, error: null });
  const queue = useRef<Promise<void>>(Promise.resolve());
  const scope = useRef<AbortController | null>(null);
  const { enabled = true, hardware = true, resetKey } = options;

  useEffect(() => {
    const controller = new AbortController();
    scope.current = controller;
    queue.current = Promise.resolve();
    return () => controller.abort();
  }, [resetKey, enabled]);

  const submit = useCallback((raw: string, source: ScanSource = 'manual') => {
    if (latest.current.enabled === false) return false;
    const parsed = parseBarcode(raw);
    if (!parsed.ok) {
      setState({ status: 'invalid', code: raw, error: null });
      return false;
    }
    const signal = scope.current?.signal;
    if (!signal || signal.aborted) return false;
    const code = parsed.value;
    const isEnabled = () => latest.current.enabled !== false;
    queue.current = queue.current.then(async () => {
      if (signal.aborted || !isEnabled()) return;
      setState({ status: 'resolving', code, error: null });
      try {
        const result = await latest.current.resolve(code, { signal, source });
        if (signal.aborted || !isEnabled()) return;
        if (result === null) {
          setState({ status: 'not-found', code, error: null });
          latest.current.onNotFound?.(code, source);
        } else {
          setState({ status: 'found', code, error: null });
          latest.current.onResult(result, code, source);
        }
      } catch (caught) {
        if (!signal.aborted)
          setState({
            status: 'error',
            code,
            error: isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', String(caught)),
          });
      }
    });
    return true;
  }, []);

  useHardwareScanner((code) => void submit(code, 'hardware'), { enabled: enabled && hardware });
  const camera = useBarcodeCamera((code) => void submit(code, 'camera'), { continuous: true, resetKey });
  const { stop } = camera;
  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);
  return { submit, status: state.status, lastCode: state.code, error: state.error, camera };
}
