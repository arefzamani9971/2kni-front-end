import { createScanGate } from './scan-gate';
import { ScannerError, type BarcodeScanner } from './barcode-scanner.types';

type Detection = { rawValue: string };
type Detector = { detect(video: HTMLVideoElement): Promise<Detection[]> };
type Decoder = { stop(): void };
type Environment = {
  secure(): boolean;
  media(): MediaDevices | undefined;
  detector(): Promise<Detector | null>;
  fallback(video: HTMLVideoElement, observe: (code: string | null) => void): Promise<Decoder>;
};
const browserEnvironment: Environment = {
  secure: () => globalThis.isSecureContext === true,
  media: () => globalThis.navigator?.mediaDevices,
  async detector() {
    const native = globalThis as unknown as {
      BarcodeDetector?: {
        new (options: { formats: string[] }): Detector;
        getSupportedFormats(): Promise<string[]>;
      };
    };
    if (!native.BarcodeDetector) return null;
    const supported = await native.BarcodeDetector.getSupportedFormats();
    const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'code_128', 'code_39'].filter((f) =>
      supported.includes(f),
    );
    return formats.length ? new native.BarcodeDetector({ formats }) : null;
  },
  async fallback(video, observe) {
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    return new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 150,
      delayBetweenScanSuccess: 150,
    }).decodeFromVideoElement(video, (result) => observe(result?.getText() ?? null));
  },
};

/** Browser/vendor details stay behind the platform facade. Starting never happens during page load. */
export function createBrowserBarcodeScanner(environment: Environment = browserEnvironment): BarcodeScanner {
  return {
    async start(video, onCode, signal) {
      if (!environment.secure()) throw new ScannerError('insecure');
      const media = environment.media();
      if (!media?.getUserMedia) throw new ScannerError('unsupported');
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      let stream: MediaStream;
      try {
        stream = await media.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch (e) {
        throw new ScannerError(
          e instanceof DOMException && ['NotAllowedError', 'SecurityError'].includes(e.name)
            ? 'denied'
            : 'unavailable',
        );
      }
      let stopped = false;
      let decoder: Decoder | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const gate = createScanGate();
      const stop = () => {
        if (stopped) return;
        stopped = true;
        if (timer) clearTimeout(timer);
        decoder?.stop();
        stream.getTracks().forEach((track) => track.stop());
        if (video.srcObject === stream) video.srcObject = null;
        signal.removeEventListener('abort', stop);
      };
      signal.addEventListener('abort', stop, { once: true });
      if (signal.aborted) {
        stop();
        throw new DOMException('Aborted', 'AbortError');
      }
      const observe = (code: string | null) => {
        if (!stopped && gate(code) && code !== null) onCode(code);
      };
      try {
        video.srcObject = stream;
        await video.play();
        const detector = await environment.detector().catch(() => null);
        if (stopped) return { stop };
        if (detector) {
          const frame = async () => {
            if (stopped) return;
            try {
              const hits = await detector.detect(video);
              observe(hits[0]?.rawValue ?? null);
            } catch {
              /* A frame can be undecodable while the camera warms up. */
            }
            if (!stopped)
              timer = setTimeout(() => {
                void frame();
              }, 150);
          };
          void frame();
        } else {
          decoder = await environment.fallback(video, observe);
          if (stopped) decoder.stop();
        }
        return { stop };
      } catch (e) {
        stop();
        throw e;
      }
    },
  };
}
