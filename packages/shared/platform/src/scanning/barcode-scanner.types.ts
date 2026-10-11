export type ScannerFailure = 'denied' | 'unsupported' | 'unavailable' | 'insecure';
export type ScannerSession = { stop(): void };
export type BarcodeScanner = {
  start(
    video: HTMLVideoElement,
    onCode: (code: string) => void,
    signal: AbortSignal,
  ): Promise<ScannerSession>;
};
export class ScannerError extends Error {
  constructor(readonly reason: ScannerFailure) {
    super(reason);
  }
}
