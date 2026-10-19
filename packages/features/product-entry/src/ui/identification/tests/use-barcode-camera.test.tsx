import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
const fake = vi.hoisted(() => ({
  start: vi.fn(async (_video: HTMLVideoElement, _callback: (code: string) => void, _signal: AbortSignal) => ({
    stop() {},
  })),
}));
vi.mock('@dukani/platform', () => ({
  createBrowserBarcodeScanner: () => fake,
  useActiveStore: () => ({ id: 's' }),
  ScannerError: class extends Error {
    reason = 'unavailable';
  },
}));
import { useBarcodeCamera } from '../hooks/use-barcode-camera';
describe('camera hook state', () => {
  it('allows restarting after an explicit stop and aborts the previous stream', async () => {
    fake.start.mockClear();
    const { result, unmount } = renderHook(() => useBarcodeCamera(() => {}));
    act(() => result.current.videoRef({} as HTMLVideoElement));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('scanning');
    const signal = fake.start.mock.calls[0]![2];
    act(() => result.current.stop());
    expect(signal.aborted).toBe(true);
    expect(result.current.state).toBe('paused');
    await act(async () => {
      await result.current.start();
    });
    expect(fake.start).toHaveBeenCalledTimes(2);
    unmount();
    expect(fake.start.mock.calls[1]![2].aborted).toBe(true);
  });
  it('does not forward malformed decoded barcodes', async () => {
    fake.start.mockClear();
    const onCode = vi.fn();
    const { result, unmount } = renderHook(() => useBarcodeCamera(onCode, { continuous: true }));
    act(() => result.current.videoRef({} as HTMLVideoElement));
    await act(async () => {
      await result.current.start();
    });
    act(() => fake.start.mock.calls[0]![1]('00123456'));
    expect(onCode).not.toHaveBeenCalled();
    act(() => fake.start.mock.calls[0]![1]('00123457'));
    expect(onCode).toHaveBeenCalledWith('00123457', fake.start.mock.calls[0]![2]);
    unmount();
  });
});
