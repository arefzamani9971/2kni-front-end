import { act, renderHook } from '@testing-library/react';
import { appError, type OperationId } from '@dukani/domain';
import type { ReactNode } from 'react';
import { DataProvider, createQueryClient } from './adapters/tanstack';
import { useFinalCommand } from './final-command';

const wrapper = ({ children }: { children: ReactNode }) => <DataProvider client={createQueryClient()}>{children}</DataProvider>;

describe('useFinalCommand', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('replays a lost response once with the same operation id', async () => {
    const ids: OperationId[] = [];
    const run = vi.fn(async (_: string, id: OperationId) => {
      ids.push(id);
      if (ids.length === 1) throw appError('Unknown', 'TIMEOUT', 'x');
      return 'ok';
    });
    const { result } = renderHook(() => useFinalCommand({ run }), { wrapper });
    let out: string | undefined;
    await act(async () => {
      const p = result.current.submit('v');
      await vi.advanceTimersByTimeAsync(1500);
      out = await p;
    });
    expect(out).toBe('ok');
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
    expect(result.current.state.kind).toBe('succeeded');
  });

  it('stays unknown after the replay and retries with the same id on demand', async () => {
    const ids: OperationId[] = [];
    let fail = true;
    const run = vi.fn(async (_: string, id: OperationId) => {
      ids.push(id);
      if (fail) throw appError('Unknown', 'NETWORK', 'x');
      return 'ok';
    });
    const { result } = renderHook(() => useFinalCommand({ run }), { wrapper });
    await act(async () => {
      const p = result.current.submit('v');
      await vi.advanceTimersByTimeAsync(1500);
      await p;
    });
    expect(result.current.state.kind).toBe('unknown');
    fail = false;
    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.state.kind).toBe('succeeded');
    expect(new Set(ids).size).toBe(1);
  });

  it('uses a fresh id for a new action after a business error', async () => {
    const ids: OperationId[] = [];
    const run = vi.fn(async (_: string, id: OperationId) => {
      ids.push(id);
      throw appError('BusinessRule', 'PURCHASE_EMPTY', 'x');
    });
    const { result } = renderHook(() => useFinalCommand({ run }), { wrapper });
    await act(async () => {
      await result.current.submit('a');
      await result.current.submit('b');
    });
    expect(result.current.state).toMatchObject({ kind: 'failed', error: { code: 'PURCHASE_EMPTY' } });
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('starts from a persisted operation id (draft review after refresh)', async () => {
    const run = vi.fn(async () => 'ok');
    const persisted = '01900000-0000-7000-8000-000000000001' as OperationId;
    const { result } = renderHook(() => useFinalCommand({ run, operationId: persisted }), { wrapper });
    await act(async () => {
      await result.current.submit('v');
    });
    expect(run).toHaveBeenCalledWith('v', persisted);
  });
});
