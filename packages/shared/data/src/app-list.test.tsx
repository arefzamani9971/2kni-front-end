import { act, renderHook, waitFor } from '@testing-library/react';
import { paginate, type ListQuery, type PagedResult } from '@dukani/domain';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDataClient, DataProvider, useAppList } from './index';

type Filter = { q: string };
const ITEMS = Array.from({ length: 45 }, (_, i) => ({ id: `p${i + 1}`, title: `Item ${i + 1}` }));

function setup(read: (query: ListQuery<Filter, 'title'>) => Promise<PagedResult<(typeof ITEMS)[number]>>) {
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DataProvider client={client}>{children}</DataProvider>
  );
  const calls: ListQuery<Filter, 'title'>[] = [];
  const spy = vi.fn((query: ListQuery<Filter, 'title'>) => {
    calls.push(query);
    return read(query);
  });
  const hook = renderHook(
    () =>
      useAppList<(typeof ITEMS)[number], Filter, 'title'>({
        queryKey: ['items', 'store-1'],
        read: (query) => spy(query),
        initialFilter: { q: '' },
      }),
    { wrapper },
  );
  return { ...hook, calls, spy };
}

const instant = (query: ListQuery<Filter, 'title'>) =>
  Promise.resolve(
    paginate(
      ITEMS.filter((item) => item.title.includes(query.filter.q)),
      query.page,
      query.pageSize,
    ),
  );

describe('useAppList (PAT-LIST-02)', () => {
  it.each(['pages', 'infinite'] as const)(
    'does not expose the previous store while loading %s',
    async (presentation) => {
      const client = createDataClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataProvider client={client}>{children}</DataProvider>
      );
      const { result, rerender } = renderHook(
        ({ store }) =>
          useAppList({
            queryKey: ['items', store],
            initialFilter: { q: '' },
            presentation,
            prefetchNext: false,
            read: () =>
              store === 'first'
                ? Promise.resolve(paginate(ITEMS, 1, 20))
                : new Promise<PagedResult<(typeof ITEMS)[number]>>(() => {}),
          }),
        { wrapper, initialProps: { store: 'first' } },
      );
      const view = () => (presentation === 'pages' ? result.current.pageView : result.current.infiniteView);
      await waitFor(() => expect(view().items).toHaveLength(20));
      rerender({ store: 'second' });
      expect(view().items).toHaveLength(0);
      expect(view().status).toBe('loading');
    },
  );

  it('stops infinite loading when the server repeats a clamped page', async () => {
    const { result, calls } = setup(() => Promise.resolve(paginate(ITEMS, 1, 20)));
    act(() => result.current.present('infinite'));
    await waitFor(() => expect(result.current.infiniteView.status).toBe('ready'));
    act(() => result.current.infiniteView.loadMore());
    await waitFor(() => expect(result.current.infiniteView.hasNextPage).toBe(false));
    expect(calls.map((call) => call.page)).toEqual([1, 2]);
  });
  it('fetches nothing until a presentation is reported, then one page and the next one in the background', async () => {
    const { result, calls } = setup(instant);
    expect(result.current.pageView.status).toBe('idle');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls).toHaveLength(0);

    act(() => result.current.present('pages'));
    await waitFor(() => expect(result.current.pageView.status).toBe('ready'));
    expect(result.current.pageView).toMatchObject({ page: 1, totalCount: 45, totalPages: 3 });
    expect(result.current.pageView.items.map((item) => item.id)).toEqual(ITEMS.slice(0, 20).map((i) => i.id));
    await waitFor(() => expect(calls.map((call) => call.page)).toEqual([1, 2]));
    expect(result.current.infiniteView.status).toBe('idle');
  });

  it('shows the prefetched next page without asking for it again, and only prefetches the one after', async () => {
    const { result, calls } = setup(instant);
    act(() => result.current.present('pages'));
    await waitFor(() => expect(calls.map((call) => call.page)).toEqual([1, 2]));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.pageView.page).toBe(2));
    await waitFor(() => expect(calls.map((call) => call.page)).toEqual([1, 2, 3]));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls.map((call) => call.page)).toEqual([1, 2, 3]);
  });

  it('keeps the previous page on screen while the next one loads', async () => {
    let release!: () => void;
    const { result } = setup((query) =>
      query.page === 3
        ? new Promise((resolve) => (release = () => resolve(paginate(ITEMS, 3, 20))))
        : instant(query),
    );
    act(() => result.current.present('pages'));
    await waitFor(() => expect(result.current.pageView.status).toBe('ready'));
    act(() => result.current.setPage(3));
    expect(result.current.pageView.isPlaceholder).toBe(true);
    expect(result.current.pageView.items[0]!.id).toBe('p1');
    await act(async () => release());
    await waitFor(() => expect(result.current.pageView.isPlaceholder).toBe(false));
    expect(result.current.pageView.items.map((item) => item.id)).toEqual(['p41', 'p42', 'p43', 'p44', 'p45']);
  });

  it('starts again at page 1 for a new filter, sort or page size and ignores unknown page sizes', async () => {
    const { result } = setup(instant);
    act(() => result.current.present('pages'));
    act(() => result.current.setPage(2));
    act(() => result.current.applyFilter({ q: 'Item 1' }));
    expect(result.current.query).toMatchObject({ page: 1, filter: { q: 'Item 1' } });
    act(() => result.current.setPage(2));
    act(() => result.current.setSort([{ field: 'title', direction: 'desc' }]));
    expect(result.current.query.page).toBe(1);
    act(() => result.current.setPageSize(37));
    expect(result.current.query.pageSize).toBe(20);
    act(() => result.current.setPageSize(50));
    expect(result.current.query).toMatchObject({ page: 1, pageSize: 50 });
  });

  it('appends pages for infinite scrolling without duplicate requests and stops at the end', async () => {
    const { result, calls } = setup(instant);
    act(() => result.current.present('infinite'));
    await waitFor(() => expect(result.current.infiniteView.status).toBe('ready'));
    expect(result.current.infiniteView).toMatchObject({ totalCount: 45, hasNextPage: true });
    act(() => {
      result.current.infiniteView.loadMore();
      result.current.infiniteView.loadMore();
    });
    await waitFor(() => expect(result.current.infiniteView.items).toHaveLength(40));
    expect(calls.map((call) => call.page)).toEqual([1, 2]);
    act(() => result.current.infiniteView.loadMore());
    await waitFor(() => expect(result.current.infiniteView.items).toHaveLength(45));
    expect(result.current.infiniteView.hasNextPage).toBe(false);
    expect(result.current.pageView.status).toBe('idle');
  });

  it('keeps loaded items when the next page fails and retries only that page', async () => {
    let fail = true;
    const { result, calls } = setup((query) =>
      query.page === 2 && fail
        ? Promise.reject({ kind: 'Server', code: 'UNAVAILABLE', message: 'down' })
        : instant(query),
    );
    act(() => result.current.present('infinite'));
    await waitFor(() => expect(result.current.infiniteView.status).toBe('ready'));
    act(() => result.current.infiniteView.loadMore());
    await waitFor(() => expect(result.current.infiniteView.loadMoreError).not.toBeNull(), { timeout: 8000 });
    expect(result.current.infiniteView.items).toHaveLength(20);
    expect(result.current.infiniteView.error).toBeNull();
    fail = false;
    act(() => result.current.infiniteView.retry());
    await waitFor(() => expect(result.current.infiniteView.items).toHaveLength(40));
    expect(calls.filter((call) => call.page === 1)).toHaveLength(1);
  }, 12000);
});
