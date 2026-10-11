'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  createBrowserBarcodeScanner,
  ScannerError,
  useActiveStore,
  type ScannerFailure,
} from '@dukani/platform';
import { parseBarcode } from '@dukani/domain';

const scanner = createBrowserBarcodeScanner();
export function useBarcodeCamera(
  onCode: (code: string, signal: AbortSignal) => void,
  { continuous = false }: { continuous?: boolean } = {},
) {
  const accepted = useRef(onCode);
  useLayoutEffect(() => {
    accepted.current = onCode;
  }, [onCode]);
  const store = useActiveStore();
  const video = useRef<HTMLVideoElement | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<'idle' | 'requesting' | 'scanning' | 'paused' | ScannerFailure>('idle');
  const stop = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setState((previous) => (previous === 'scanning' || previous === 'requesting' ? 'paused' : previous));
  }, []);
  useEffect(() => {
    const background = () => {
      if (document.hidden) {
        stop();
        setState('paused');
      }
    };
    document.addEventListener('visibilitychange', background);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', background);
    };
  }, [store.id, stop]);
  const start = async () => {
    if (!video.current || controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setState('requesting');
    try {
      await scanner.start(
        video.current,
        (code) => {
          if (current.signal.aborted) return;
          const parsed = parseBarcode(code);
          if (!parsed.ok) return;
          if (!continuous) {
            stop();
            setState('paused');
          }
          accepted.current(parsed.value, current.signal);
        },
        current.signal,
      );
      if (!current.signal.aborted) setState('scanning');
    } catch (error) {
      if (!current.signal.aborted) {
        stop();
        setState(error instanceof ScannerError ? error.reason : 'unavailable');
      }
    }
  };
  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (video.current !== node && controller.current) {
        stop();
        setState('paused');
      }
      video.current = node;
    },
    [stop],
  );
  return { videoRef, state, start, stop };
}
