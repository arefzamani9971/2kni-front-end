import type { BarcodeScanner, ScannerFailure } from './barcode-scanner.types';

export type BarcodeCameraState = 'idle' | 'requesting' | 'scanning' | 'paused' | ScannerFailure;

export type BarcodeCameraOptions = {
  /** Keep scanning after a code (sale, bulk entry); otherwise the camera pauses after the first code. */
  readonly continuous?: boolean;
  /** Changing it (e.g. the active store id) stops the camera. */
  readonly resetKey?: string;
  /** Injected for tests; defaults to the browser scanner (BarcodeDetector or zxing). */
  readonly scanner?: BarcodeScanner;
};

export type BarcodeCamera = {
  /** Attach to the `<video>` of `ScanCamera`/`ScanArea`. */
  readonly videoRef: (node: HTMLVideoElement | null) => void;
  readonly state: BarcodeCameraState;
  /** Starts only on a user action (never during page load). */
  readonly start: () => Promise<void>;
  readonly stop: () => void;
};
