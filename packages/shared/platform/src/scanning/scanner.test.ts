import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserBarcodeScanner } from './browser-barcode-scanner';
import { createScanGate } from './scan-gate';

describe('camera scanner lifecycle', () => {
  afterEach(() => vi.useRealTimers());
  it('accepts a stable code once, and accepts it again only after it leaves the frame', () => {
    const gate = createScanGate();
    expect([gate('00123457'), gate('00123457'), gate(null), gate('00123457')]).toEqual([
      true,
      false,
      false,
      true,
    ]);
  });
  it('does not request permission in an insecure context', async () => {
    const getUserMedia = vi.fn();
    const scanner = createBrowserBarcodeScanner({
      secure: () => false,
      media: () => ({ getUserMedia }) as unknown as MediaDevices,
      detector: async () => null,
      fallback: vi.fn(),
    });
    await expect(
      scanner.start({} as HTMLVideoElement, vi.fn(), new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'insecure' });
    expect(getUserMedia).not.toHaveBeenCalled();
  });
  it('releases a stream even when permission resolves after navigation', async () => {
    let resolve!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>((r) => {
      resolve = r;
    });
    const stop = vi.fn();
    const scanner = createBrowserBarcodeScanner({
      secure: () => true,
      media: () => ({ getUserMedia: () => pending }) as unknown as MediaDevices,
      detector: async () => null,
      fallback: vi.fn(),
    });
    const controller = new AbortController();
    const started = scanner.start({} as HTMLVideoElement, vi.fn(), controller.signal);
    controller.abort();
    resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream);
    await expect(started).rejects.toMatchObject({ name: 'AbortError' });
    expect(stop).toHaveBeenCalledOnce();
  });
  it('stops fallback decoding and tracks once, and rejects late observations', async () => {
    const stopTrack = vi.fn();
    const stopDecoder = vi.fn();
    const onCode = vi.fn();
    let observe!: (code: string | null) => void;
    const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;
    const video = { play: async () => {}, srcObject: null } as unknown as HTMLVideoElement;
    const scanner = createBrowserBarcodeScanner({
      secure: () => true,
      media: () => ({ getUserMedia: async () => stream }) as unknown as MediaDevices,
      detector: async () => null,
      fallback: async (_, callback) => {
        observe = callback;
        return { stop: stopDecoder };
      },
    });
    const controller = new AbortController();
    const session = await scanner.start(video, onCode, controller.signal);
    observe('00123457');
    observe('00123457');
    controller.abort();
    session.stop();
    observe('9876');
    expect(onCode).toHaveBeenCalledExactlyOnceWith('00123457');
    expect(stopTrack).toHaveBeenCalledOnce();
    expect(stopDecoder).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });
  it('maps denied permission to a stable machine reason', async () => {
    const scanner = createBrowserBarcodeScanner({
      secure: () => true,
      media: () =>
        ({
          getUserMedia: async () => {
            throw new DOMException('denied', 'NotAllowedError');
          },
        }) as unknown as MediaDevices,
      detector: async () => null,
      fallback: vi.fn(),
    });
    await expect(
      scanner.start({} as HTMLVideoElement, vi.fn(), new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'denied' });
  });
});
