import { act, renderHook, waitFor } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import type * as Platform from '@dukani/platform';
import type { ReactNode } from 'react';
import { useProductAutocomplete } from './use-product-autocomplete';

const mocks = vi.hoisted(() => ({ page: vi.fn() }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store' }),
}));
vi.mock('../../module', () => ({ usePurchasingModule: () => ({ productPages: { page: mocks.page } }) }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <DataProvider client={createDataClient()}>{children}</DataProvider>
);
const row = {
  id: 'p',
  title: 'خودکار',
  sku: '1',
  barcode: null,
  baseUnitName: 'عدد',
  onHand: '0',
  salePrice: null,
  hasStockHistory: false,
};

beforeEach(() => {
  mocks.page.mockReset();
  mocks.page.mockImplementation(async (_: string, query: { filter: { q: string } }) => ({
    items: query.filter.q === 'خودکار' ? [row] : [],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  }));
});

describe('purchase product autocomplete policy (spec/front/autocomplete.md)', () => {
  it('0–2 characters send nothing; typing settles into one request for the last text only', async () => {
    const { result } = renderHook(() => useProductAutocomplete(), { wrapper });
    act(() => result.current.setQuery('خو'));
    expect(result.current.status).toBe('belowMinimum');
    act(() => result.current.setQuery('خود'));
    act(() => result.current.setQuery('خودک'));
    act(() => result.current.setQuery('خودکار'));
    expect(result.current.status).toBe('debouncing');
    await waitFor(() => expect(result.current.status).toBe('results'));
    expect(mocks.page).toHaveBeenCalledTimes(1);
    expect(mocks.page.mock.calls[0]![1]).toMatchObject({ page: 1, filter: { q: 'خودکار' } });
    expect(result.current.items).toEqual([row]);
  });

  it('dropping below the minimum clears the previous results; an empty answer is not an error', async () => {
    const { result } = renderHook(() => useProductAutocomplete(), { wrapper });
    act(() => result.current.setQuery('مداد'));
    await waitFor(() => expect(result.current.status).toBe('empty'));
    act(() => result.current.setQuery('مد'));
    expect(result.current.status).toBe('belowMinimum');
    expect(result.current.items).toEqual([]);
  });

  it('a failed search is an error with a retry of the same query', async () => {
    mocks.page.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useProductAutocomplete(), { wrapper });
    act(() => result.current.setQuery('خودکار'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('results'));
    expect(mocks.page.mock.calls.map((c) => c[1].filter.q)).toEqual(['خودکار', 'خودکار']);
  });
});
