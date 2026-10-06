import { act, renderHook, waitFor } from '@testing-library/react';
import { appError } from '@dukani/domain';
import type { ReactNode } from 'react';
import {
  createDataClient,
  createQueryKeys,
  DataProvider,
  useAppInfiniteQuery,
  useAppMutation,
  useAppQuery,
  useInvalidate,
  useQueryCache,
} from './index';
import { resolveDataClient } from './adapters/tanstack/data-client';

function setup() {
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DataProvider client={client}>{children}</DataProvider>
  );
  return { client, wrapper };
}

describe('data facade contract', () => {
  it('separates store and feature key prefixes without changing existing key shapes', () => {
    const keys = createQueryKeys('products');
    expect(keys('a').list({ q: 'tea' })).toEqual(['products', 'a', 'list', { q: 'tea' }]);
    expect(keys('a').detail('1')).not.toEqual(keys('b').detail('1'));
    expect(keys('a').all).not.toEqual(createQueryKeys('reports')('a').all);
    expect(keys().all).toEqual(['products']);
  });

  it('forwards cancellation to the query operation when its observer unmounts', async () => {
    let signal: AbortSignal | undefined;
    const queryFn = vi.fn(({ signal: current }: { signal: AbortSignal }) => {
      signal = current;
      return new Promise<string>((_resolve, reject) =>
        current.addEventListener('abort', () => reject(current.reason)),
      );
    });
    const { unmount } = renderHook(() => useAppQuery({ queryKey: ['cancel'], queryFn }), setup());
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });
  it('exposes an opaque handle and stable cache API, isolated per client', () => {
    const first = setup();
    const second = setup();
    expect(Object.keys(first.client)).toEqual([]);
    expect(Object.isFrozen(first.client)).toBe(true);
    const a = renderHook(() => useQueryCache(), first);
    const b = renderHook(() => useQueryCache(), second);
    const cache = a.result.current;
    expect(cache.set(['same'], 7)).toBeUndefined();
    a.rerender();
    expect(a.result.current).toBe(cache);
    expect(cache.get(['same'])).toBe(7);
    expect(b.result.current.get(['same'])).toBeUndefined();
  });

  it('refresh returns selected data and a failed refresh does not report stale data as success', async () => {
    const failure = appError('Permission', 'DENIED', 'denied');
    let fail = false;
    const queryFn = vi.fn(async () => {
      if (fail) throw failure;
      return { count: 3 };
    });
    const { result } = renderHook(
      () => useAppQuery({ queryKey: ['selected'], queryFn, select: (value) => value.count }),
      setup(),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      expect(await result.current.refetch()).toEqual({ ok: true, data: 3 });
    });
    fail = true;
    await act(async () => {
      expect(await result.current.refetch()).toEqual({ ok: false, error: failure });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBe(3);
    expect(queryFn).toHaveBeenCalledTimes(3);
  });

  it('infinite refresh returns flat items, without adapter page metadata', async () => {
    const { result } = renderHook(
      () =>
        useAppInfiniteQuery({
          queryKey: ['pages'],
          queryFn: async ({ cursor }) =>
            cursor ? { items: [2], nextCursor: null } : { items: [1], nextCursor: 'next' },
        }),
      setup(),
    );
    await waitFor(() => expect(result.current.items).toEqual([1]));
    act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.items).toEqual([1, 2]));
    await act(async () => {
      expect(await result.current.refetch()).toEqual({ ok: true, data: [1, 2] });
    });
  });

  it('invalidates only the requested key prefix and refetches active queries', async () => {
    const a = vi.fn(async () => 1);
    const b = vi.fn(async () => 2);
    const { result } = renderHook(
      () => ({
        a: useAppQuery({ queryKey: ['store', 'a'], queryFn: a }),
        b: useAppQuery({ queryKey: ['other', 'b'], queryFn: b }),
        invalidate: useInvalidate(),
      }),
      setup(),
    );
    await waitFor(() => expect(result.current.a.isSuccess && result.current.b.isSuccess).toBe(true));
    await act(async () => {
      await result.current.invalidate(['store']);
    });
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('successful mutation refreshes affected queries; failure is not retried', async () => {
    const queryFn = vi.fn(async () => 1);
    let fail = false;
    const mutationFn = vi.fn(async () => {
      if (fail) throw appError('Server', 'SERVER', 'failed');
      return 2;
    });
    const { result } = renderHook(
      () => ({
        query: useAppQuery({ queryKey: ['affected'], queryFn }),
        mutation: useAppMutation({ mutationFn, invalidates: [['affected']] }),
      }),
      setup(),
    );
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await result.current.mutation.mutateAsync();
    });
    expect(queryFn).toHaveBeenCalledTimes(2);
    fail = true;
    await act(async () => {
      await expect(result.current.mutation.mutateAsync()).rejects.toMatchObject({ code: 'SERVER' });
    });
    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('applies the read retry budget through the real adapter', async () => {
    const { client, wrapper } = setup();
    // Only the adapter test changes the timer; the public handle cannot change retry defaults.
    resolveDataClient(client).setDefaultOptions({
      queries: {
        ...resolveDataClient(client).getDefaultOptions().queries,
        retryDelay: 0,
      },
    });
    const queryFn = vi.fn(async () => {
      throw appError('Server', 'SERVER', 'failed');
    });
    const { result } = renderHook(() => useAppQuery({ queryKey: ['retry'], queryFn }), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(3);
  });
});
