import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import type * as Platform from '@dukani/platform';
import { lookupTitleKey } from '../../domain/lookup-title';
import { EntryLookupScreen } from './EntryLookupScreen';

const mocks = vi.hoisted(() => ({ push: vi.fn(), lookup: vi.fn() }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
}));
vi.mock('../hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ method: vi.fn(), nav: { push: mocks.push, replace: vi.fn() } }),
}));
vi.mock('../hooks/use-start-entry', () => ({
  useStartEntry: () => ({ startFromCatalog: vi.fn(), startNew: vi.fn() }),
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({ catalog: { lookupBarcode: mocks.lookup } }),
}));

const match = (baseQty: string, unitName: string) => ({
  catalogItemId: 'item',
  catalogItemUnitId: 'unit-' + baseQty,
  title: 'خودکار پنتر ۰٫۷ آبی',
  unitName,
  baseQty,
  storeProductId: 'product',
  storeProductUnitId: 'store-unit-' + baseQty,
  available: '120',
  unitPriceAmount: '170000',
  catalogStatus: 'Public',
  itemKind: 'Goods',
  storeProductStatus: 'Active',
  isSellable: true,
  unitActive: true,
});
const scan = (code: string) => {
  for (const char of code) fireEvent.keyDown(document.body, { key: char, code: `Digit${char}` });
  fireEvent.keyDown(document.body, { key: 'Enter', code: 'Enter' });
};
const show = (code: string) =>
  render(
    <DataProvider client={createDataClient()}>
      <EntryLookupScreen code={code} origin="hardware" />
    </DataProvider>,
  );

beforeEach(() => {
  mocks.push.mockReset();
  mocks.lookup.mockReset();
});

describe('barcode lookup result (F09)', () => {
  it('titles the designed branches and keeps the generic title elsewhere', () => {
    const pack = [match('20', 'بستهٔ ۲۰تایی')] as never[];
    expect(lookupTitleKey('StoreProduct', pack)).toBe('lookup.packageTitle');
    expect(lookupTitleKey('GlobalCatalog', pack)).toBe('lookup.packageTitle');
    expect(lookupTitleKey('StoreProduct', [match('1', 'عدد')] as never[])).toBe('barcodeResults');
    expect(lookupTitleKey('Multiple', [...pack, ...pack])).toBe('barcodeResults');
    expect(lookupTitleKey('Conflict', pack)).toBe('lookup.conflictTitle');
    expect(lookupTitleKey('Unknown', [])).toBe('barcodeResults');
  });

  it('a package result says so and keeps the unit and its factor', async () => {
    mocks.lookup.mockResolvedValue({
      code: '2001003000019',
      kind: 'StoreProduct',
      matches: [match('20', 'بستهٔ ۲۰تایی')],
      message: null,
    });
    show('2001003000019');
    expect((await screen.findAllByText('بارکد بسته شناسایی شد')).length).toBeGreaterThan(0);
    expect(screen.getByText('بستهٔ ۲۰تایی · ۲۰')).toBeInTheDocument();
  });

  it('a hardware scan opens the next lookup without a button', async () => {
    mocks.lookup.mockResolvedValue({ code: '4006381333931', kind: 'Unknown', matches: [], message: null });
    show('4006381333931');
    await screen.findByText('کالایی با این بارکد پیدا نشد.');
    act(() => scan('2001003000019'));
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
      '/s/store/entry/search?q=2001003000019&origin=hardware',
    );
  });

  it('an invalid code is shown as invalid without a request', () => {
    show('4006381333932');
    expect(screen.getByText('قالب یا رقم کنترل بارکد معتبر نیست.')).toBeInTheDocument();
    expect(mocks.lookup).not.toHaveBeenCalled();
  });
});
