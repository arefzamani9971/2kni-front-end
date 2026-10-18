import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen } from '@testing-library/react';
import { DataProvider, createDataClient, type DataClient } from '@dukani/data';
import type * as Platform from '@dukani/platform';
import { EntrySelectionScreen } from './EntrySelectionScreen';

const mocks = vi.hoisted(() => ({
  catalogItem: vi.fn(),
  storeProduct: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  startFromCatalog: vi.fn(),
}));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({
    catalog: { catalogItem: mocks.catalogItem, storeProduct: mocks.storeProduct },
    selections: { read: mocks.read, write: mocks.write },
  }),
}));
vi.mock('../hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ nav: { replace: mocks.replace, push: mocks.push } }),
}));
vi.mock('../hooks/use-start-entry', () => ({
  useStartEntry: () => ({ startFromCatalog: mocks.startFromCatalog }),
}));

const item = {
  id: 'item',
  title: 'مدادرنگی آریا ۱۲رنگ',
  status: 'Public',
  kind: 'Goods',
  productType: { name: 'مدادرنگی' },
  brand: { name: 'آریا' },
  baseUnit: { name: 'عدد' },
  images: [],
  attributes: [],
  units: [],
  netContentValue: null,
  description: null,
  myStoreProductId: null,
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mocks.catalogItem.mockReset().mockResolvedValue(item);
  mocks.storeProduct.mockReset();
  mocks.read.mockReset().mockResolvedValue(null);
  mocks.write.mockReset().mockResolvedValue(undefined);
  mocks.replace.mockReset();
  mocks.push.mockReset();
  mocks.startFromCatalog.mockReset().mockResolvedValue(undefined);
});
afterEach(() => vi.useRealTimers());

const show = (client: DataClient = createDataClient()) =>
  render(
    <DataProvider client={client}>
      <EntrySelectionScreen query="مدادرنگی" itemId="item" filters={{}} />
    </DataProvider>,
  );
const nameField = () => screen.findByRole('textbox', { name: /نام نمایشی/ });
const typeName = async (value: string) => fireEvent.change(await nameField(), { target: { value } });
const continueButton = () => screen.getByRole('button', { name: 'بررسی و ادامه' });

describe('catalog item selection (F07): the item, the store’s own name and note, and the start', () => {
  it('typing the name writes the draft once per burst, not once per key', async () => {
    show();
    for (const value of ['م', 'مد', 'مدا', 'مداد', 'مداد م', 'مداد مش', 'مداد مشک', 'مداد مشکی']) {
      await typeName(value);
      await act(() => vi.advanceTimersByTimeAsync(50));
    }
    await act(() => vi.advanceTimersByTimeAsync(1000));
    // the first key at once (a refresh right after it keeps it), the rest of the burst once
    expect(mocks.write).toHaveBeenCalledTimes(2);
    expect(mocks.write).toHaveBeenLastCalledWith('store', 'item', {
      schemaVersion: 1,
      localTitle: 'مداد مشکی',
      localNote: '',
    });
  });

  it('the search field is a draft: typing stays on the item, Enter returns to the results', async () => {
    let resolveItem: (value: typeof item) => void = () => undefined;
    mocks.catalogItem.mockReturnValue(new Promise((resolve) => (resolveItem = resolve)));
    show();
    // typed while the item is still loading: kept when the item appears
    fireEvent.change(await screen.findByLabelText('جست‌وجوی نام یا بارکد'), { target: { value: 'مداد' } });
    await act(async () => resolveItem(item));
    await nameField();
    const search = screen.getByLabelText('جست‌وجوی نام یا بارکد');
    expect(search).toHaveValue('مداد');
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.submit(search.closest('form')!);
    // a step forward, so Back returns to the item
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push.mock.calls[0]?.[0]).toContain('q=' + encodeURIComponent('مداد'));
  });

  it('«بررسی و ادامه» saves the latest input first, then starts the entry with it', async () => {
    show();
    await typeName('مداد');
    await typeName('مداد مشکی');
    fireEvent.click(continueButton());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.write).toHaveBeenLastCalledWith('store', 'item', {
      schemaVersion: 1,
      localTitle: 'مداد مشکی',
      localNote: '',
    });
    expect(mocks.startFromCatalog).toHaveBeenCalledTimes(1);
    expect(mocks.startFromCatalog).toHaveBeenCalledWith('item', null, {
      localTitle: 'مداد مشکی',
      localNote: '',
    });
    const lastWrite = mocks.write.mock.invocationCallOrder.at(-1)!;
    expect(lastWrite).toBeLessThan(mocks.startFromCatalog.mock.invocationCallOrder[0]!);
  });

  it('a draft that cannot be saved does not start the entry, and says so', async () => {
    mocks.write.mockRejectedValue(new Error('IDB'));
    show();
    await typeName('مداد مشکی');
    fireEvent.click(continueButton());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.startFromCatalog).not.toHaveBeenCalled();
    expect(screen.getByText('شروع ثبت انجام نشد؛ دوباره تلاش کنید.')).toBeInTheDocument();
  });

  it('a second click while the entry starts sends one start', async () => {
    mocks.startFromCatalog.mockReturnValue(new Promise(() => undefined));
    show();
    await nameField();
    fireEvent.click(continueButton());
    fireEvent.click(continueButton());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.startFromCatalog).toHaveBeenCalledTimes(1);
  });

  it('coming back to the same item shows what was saved last, without reading the draft again', async () => {
    const client = createDataClient();
    const first = show(client);
    await typeName('مداد مشکی');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    first.unmount();
    show(client);
    expect(await nameField()).toHaveValue('مداد مشکی');
    expect(mocks.read).toHaveBeenCalledTimes(1);
  });
});
