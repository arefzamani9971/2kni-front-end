import { act, renderHook } from '@testing-library/react';
import { appError, type OperationId } from '@dukani/domain';
import type { ReactNode } from 'react';
import { DataProvider, createDataClient } from './adapters/tanstack';
import { useFinalCommand } from './final-command';
import { resolveDataClient } from './adapters/tanstack/data-client';

const wrapper = ({ children }: { children: ReactNode }) => (
  <DataProvider client={createDataClient()}>{children}</DataProvider>
);

describe('useFinalCommand', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([new Error('navigation failed'), appError('Unknown', 'NETWORK', 'local failure')])(
    'keeps server success when onSuccess fails: %s',
    async (failure) => {
      const run = vi.fn(async () => 'receipt');
      const onSuccess = vi.fn(async () => {
        throw failure;
      });
      const { result } = renderHook(() => useFinalCommand({ run, onSuccess }), { wrapper });
      await act(async () => {
        expect(await result.current.submit('v')).toBe('receipt');
      });
      expect(result.current.state).toEqual({ kind: 'succeeded', result: 'receipt' });
      expect(result.current.completionErrors).toMatchObject([{ phase: 'onSuccess' }]);
      expect(result.current.busy).toBe(false);
      await act(async () => {
        expect(await result.current.retry()).toBeUndefined();
      });
      expect(run).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    },
  );

  it('runs onSuccess despite failed invalidation and records both local failures', async () => {
    const client = createDataClient();
    vi.spyOn(resolveDataClient(client), 'invalidateQueries').mockRejectedValue(
      appError('Unknown', 'TIMEOUT', 'cache'),
    );
    const localWrapper = ({ children }: { children: ReactNode }) => (
      <DataProvider client={client}>{children}</DataProvider>
    );
    const run = vi.fn(async () => 'created');
    const onSuccess = vi.fn(async () => {
      throw new Error('callback');
    });
    const { result } = renderHook(() => useFinalCommand({ run, onSuccess, invalidates: [['list']] }), {
      wrapper: localWrapper,
    });
    await act(async () => {
      expect(await result.current.submit('v')).toBe('created');
    });
    expect(result.current.state.kind).toBe('succeeded');
    expect(result.current.completionErrors.map((e) => e.phase)).toEqual(['invalidation', 'onSuccess']);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('joins concurrent submits/retries through local completion and ignores reset while busy', async () => {
    let finish!: () => void;
    const completion = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const run = vi.fn(async (_variables: string) => 'created');
    const { result } = renderHook(() => useFinalCommand({ run, onSuccess: () => completion }), { wrapper });
    let first!: Promise<string | undefined>;
    await act(async () => {
      first = result.current.submit('original');
    });
    expect(result.current.state.kind).toBe('succeeded');
    expect(result.current.busy).toBe(true);
    expect(result.current.submit('different')).toBe(first);
    expect(result.current.retry()).toBe(first);
    act(() => result.current.reset());
    expect(result.current.state.kind).toBe('succeeded');
    await act(async () => {
      finish();
      await first;
    });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]?.[0]).toBe('original');
    expect(result.current.busy).toBe(false);
    act(() => result.current.reset());
    expect(result.current.state.kind).toBe('idle');
  });

  it('does not replay an explicitly aborted request', async () => {
    const run = vi.fn(async (_variables: string, _id: OperationId) => {
      throw appError('Unknown', 'ABORTED', 'cancelled');
    });
    const { result } = renderHook(() => useFinalCommand({ run }), { wrapper });
    await act(async () => {
      await result.current.submit('v');
    });
    expect(result.current.state.kind).toBe('unknown');
    expect(run).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.retry();
    });
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[0]?.[1]).toBe(run.mock.calls[1]?.[1]);
  });

  it('does not replay a command after the owning screen unmounts', async () => {
    const run = vi.fn(async () => {
      throw appError('Unknown', 'TIMEOUT', 'lost');
    });
    const { result, unmount } = renderHook(() => useFinalCommand({ run }), { wrapper });
    let pending!: Promise<unknown>;
    await act(async () => {
      pending = result.current.submit('v');
    });
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
      await pending;
    });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not run a success callback after the owning screen unmounts', async () => {
    let finish!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      finish = resolve;
    });
    const onSuccess = vi.fn();
    const { result, unmount } = renderHook(() => useFinalCommand({ run: () => pending, onSuccess }), {
      wrapper,
    });
    let submission!: Promise<unknown>;
    act(() => {
      submission = result.current.submit('v');
    });
    unmount();
    await act(async () => {
      finish('created');
      await submission;
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

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
