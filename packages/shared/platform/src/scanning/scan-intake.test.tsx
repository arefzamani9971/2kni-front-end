import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BarcodeScanner } from './barcode-scanner.types';
import { useBarcodeCamera } from './use-barcode-camera';
import { useHardwareScanner } from './use-hardware-scanner';
import { useScanIntake } from './use-scan-intake';

const scan = (code: string, target: Window | HTMLElement = window) => {
  for (const char of code)
    fireEvent.keyDown(target, { key: char, code: /\d/.test(char) ? `Digit${char}` : '' });
  fireEvent.keyDown(target, { key: 'Enter', code: 'Enter' });
};

function Scanner({ onScan }: { onScan: (code: string) => void }) {
  useHardwareScanner(onScan);
  return (
    <>
      <input aria-label="نام مشتری" />
      <button type="button">ثبت</button>
    </>
  );
}

describe('useHardwareScanner', () => {
  it('reads a scan anywhere on the page but never from a text field the user types in', () => {
    const onScan = vi.fn();
    const pressed = vi.fn();
    render(<Scanner onScan={onScan} />);
    screen.getByRole('button').addEventListener('keydown', pressed);
    scan('6261234567890', screen.getByRole('button'));
    expect(onScan).toHaveBeenCalledWith('6261234567890');
    expect(pressed).toHaveBeenCalledTimes(13);
    scan('12345678', screen.getByLabelText('نام مشتری'));
    expect(onScan).toHaveBeenCalledTimes(1);
  });
});

describe('useScanIntake', () => {
  it('rejects all intake sources while disabled and drops an in-flight result', async () => {
    let release!: () => void;
    const onResult = vi.fn();
    const resolve = vi.fn(
      () =>
        new Promise<string>((done) => {
          release = () => done('item');
        }),
    );
    const { result, rerender } = renderHook(({ enabled }) => useScanIntake({ enabled, resolve, onResult }), {
      initialProps: { enabled: true },
    });
    act(() => {
      result.current.submit('123456');
    });
    await waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));
    rerender({ enabled: false });
    expect(result.current.submit('234567', 'camera')).toBe(false);
    expect(result.current.submit('345678', 'manual')).toBe(false);
    await act(async () => release());
    expect(onResult).not.toHaveBeenCalled();
  });
  it('resolves codes one at a time in scan order, whatever each lookup takes', async () => {
    const delays: Record<string, number> = { '11111': 40, '22222': 0, '33333': 10 };
    const onResult = vi.fn();
    const { result } = renderHook(() =>
      useScanIntake({
        resolve: (code) => new Promise((resolve) => setTimeout(() => resolve({ code }), delays[code])),
        onResult,
      }),
    );
    act(() => {
      result.current.submit('11111', 'hardware');
      result.current.submit('22222', 'camera');
      result.current.submit('33333');
    });
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(3));
    expect(onResult.mock.calls.map(([, code, source]) => `${code}:${source}`)).toEqual([
      '11111:hardware',
      '22222:camera',
      '33333:manual',
    ]);
    expect(result.current).toMatchObject({ status: 'found', lastCode: '33333' });
  });

  it('rejects invalid codes, reports not-found and drops answers after unmount', async () => {
    const onNotFound = vi.fn();
    const onResult = vi.fn();
    let release!: () => void;
    const { result, unmount } = renderHook(() =>
      useScanIntake({
        resolve: (code) =>
          code === '00000'
            ? Promise.resolve(null)
            : new Promise((resolve) => (release = () => resolve({ code }))),
        onResult,
        onNotFound,
      }),
    );
    let accepted = true;
    act(() => {
      accepted = result.current.submit('12 34');
    });
    expect(accepted).toBe(false);
    expect(result.current.status).toBe('invalid');
    act(() => void result.current.submit('00000'));
    await waitFor(() => expect(onNotFound).toHaveBeenCalledWith('00000', 'manual'));
    act(() => void result.current.submit('98765'));
    await waitFor(() => expect(result.current.status).toBe('resolving'));
    unmount();
    release();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onResult).not.toHaveBeenCalled();
  });
});

describe('useBarcodeCamera (shared)', () => {
  it('restarts after stop, aborts the previous stream and forwards only valid codes', async () => {
    const start = vi.fn(async () => ({ stop() {} }));
    const scanner = { start } as unknown as BarcodeScanner;
    const onCode = vi.fn();
    const { result, unmount } = renderHook(() => useBarcodeCamera(onCode, { continuous: true, scanner }));
    act(() => result.current.videoRef({} as HTMLVideoElement));
    await act(async () => result.current.start());
    expect(result.current.state).toBe('scanning');
    const [, deliver, signal] = start.mock.calls[0] as unknown as [
      unknown,
      (code: string) => void,
      AbortSignal,
    ];
    act(() => deliver('00 12'));
    expect(onCode).not.toHaveBeenCalled();
    act(() => deliver('00123457'));
    expect(onCode).toHaveBeenCalledWith('00123457', signal);
    act(() => result.current.stop());
    expect(signal.aborted).toBe(true);
    unmount();
  });
});
