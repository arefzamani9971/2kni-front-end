import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import type * as Platform from '@dukani/platform';
import { SearchResults } from '../components/SearchResults';

const mocks = vi.hoisted(() => ({
  storeProducts: vi.fn(),
  catalogItems: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
  useOnlineStatus: () => true,
}));
vi.mock('../../../module', () => ({
  useProductEntryModule: () => ({
    catalog: { storeProducts: mocks.storeProducts, catalogItems: mocks.catalogItems },
  }),
}));
vi.mock('../../common/hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ method: vi.fn(), nav: { replace: mocks.replace, push: vi.fn() } }),
}));
vi.mock('../../common/hooks/use-start-entry', () => ({ useStartEntry: () => ({ startNew: vi.fn() }) }));

const empty = { items: [], nextCursor: null };

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mocks.storeProducts.mockReset().mockResolvedValue(empty);
  mocks.catalogItems.mockReset().mockResolvedValue(empty);
  mocks.replace.mockReset();
});
afterEach(() => vi.useRealTimers());

const show = () =>
  render(
    <DataProvider client={createDataClient()}>
      <SearchResults query="" bulk={false} filters={{}} />
    </DataProvider>,
  );
const type = (value: string) =>
  fireEvent.change(screen.getByRole('combobox', { name: 'جست‌وجوی نام یا بارکد' }), { target: { value } });

describe('entry catalog search (F07) under the autocomplete policy', () => {
  it('0–2 meaningful characters: a hint and no request', async () => {
    show();
    type('رب');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(screen.getByText('برای جست‌وجو حداقل ۳ نویسه وارد کنید.')).toHaveAttribute('role', 'status');
    expect(mocks.catalogItems).not.toHaveBeenCalled();
    expect(mocks.storeProducts).not.toHaveBeenCalled();
  });

  it('fast typing sends one request per list, 300ms after the last change', async () => {
    show();
    for (const value of ['خود', 'خودک', 'خودکا', 'خودکار']) {
      type(value);
      await act(() => vi.advanceTimersByTimeAsync(100));
    }
    expect(mocks.catalogItems).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(mocks.catalogItems).toHaveBeenCalledTimes(1);
    expect(mocks.catalogItems.mock.calls[0]?.[1]).toBe('خودکار');
    expect(mocks.storeProducts).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenLastCalledWith(
      expect.stringContaining('q=%D8%AE%D9%88%D8%AF%DA%A9%D8%A7%D8%B1'),
    );
  });

  it('Enter (a scanner’s trailing Enter) settles the code without waiting', async () => {
    show();
    type('6261234567890');
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'جست‌وجوی نام یا بارکد' }), { key: 'Enter' });
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.catalogItems).toHaveBeenCalledTimes(1);
    expect(mocks.catalogItems.mock.calls[0]?.[1]).toBe('6261234567890');
  });
});
