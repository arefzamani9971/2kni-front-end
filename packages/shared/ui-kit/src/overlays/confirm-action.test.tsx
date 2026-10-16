import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useConfirmAction } from './use-confirm-action';

describe('useConfirmAction', () => {
  it('keeps the original target and blocks closing in the same event that starts the command', async () => {
    let release!: () => void;
    const run = vi.fn((_id: string) => new Promise<void>((resolve) => { release = resolve; }));
    const { result } = renderHook(() => useConfirmAction(run));
    act(() => result.current.open('first'));
    act(() => {
      result.current.dialog.onConfirm();
      result.current.dialog.onOpenChange(false);
      result.current.open('second');
    });
    expect(result.current.dialog.open).toBe(true);
    expect(result.current.target).toBe('first');
    expect(run).toHaveBeenCalledWith('first');
    await act(async () => release());
  });
  it('runs once per confirm, closes on success and stays open with the error on failure', async () => {
    let fail = true;
    const run = vi.fn(async (_id: string) => {
      if (fail) throw { kind: 'BusinessRule', code: 'SUPPLIER_HAS_HISTORY', message: 'سابقه دارد' };
    });
    const { result } = renderHook(() => useConfirmAction(run));
    act(() => result.current.open('s1'));
    expect(result.current.dialog.open).toBe(true);
    expect(result.current.target).toBe('s1');
    await act(async () => {
      result.current.dialog.onConfirm();
      result.current.dialog.onConfirm();
    });
    expect(run).toHaveBeenCalledTimes(1);
    expect(result.current.error?.code).toBe('SUPPLIER_HAS_HISTORY');
    expect(result.current.dialog.open).toBe(true);
    fail = false;
    await act(async () => result.current.dialog.onConfirm());
    expect(result.current.dialog.open).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not close while the command runs', async () => {
    let release!: () => void;
    const { result } = renderHook(() =>
      useConfirmAction(() => new Promise<void>((resolve) => (release = resolve))),
    );
    act(() => result.current.open());
    act(() => result.current.dialog.onConfirm());
    expect(result.current.dialog.loading).toBe(true);
    act(() => result.current.dialog.onOpenChange(false));
    expect(result.current.dialog.open).toBe(true);
    await act(async () => release());
    expect(result.current.dialog.open).toBe(false);
  });
});
