'use client';
import { parseBarcode } from '@dukani/domain';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BarcodeCamera, BarcodeCameraOptions, BarcodeCameraState } from './barcode-camera.types';
import { ScannerError } from './barcode-scanner.types';
import { createBrowserBarcodeScanner } from './browser-barcode-scanner';

const browserScanner = createBrowserBarcodeScanner();

/**
 * Camera scanning for every screen (PAT-SCAN-01): starts on a user action, releases the camera in the background,
 * on unmount and when `resetKey` changes, and forwards only valid barcodes. Pair it with `ScanArea`/`ScanCamera`.
 */
export function useBarcodeCamera(
  onCode: (code: string, signal: AbortSignal) => void,
  { continuous = false, resetKey, scanner = browserScanner }: BarcodeCameraOptions = {},
): BarcodeCamera {
  const accepted = useRef(onCode);
  useLayoutEffect(() => {
    accepted.current = onCode;
  }, [onCode]);
  const video = useRef<HTMLVideoElement | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [state, setState] = useState<BarcodeCameraState>('idle');
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
  }, [resetKey, stop]);
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
