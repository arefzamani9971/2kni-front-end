import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type * as Platform from '@dukani/platform';
import { ViewportProvider } from '@dukani/ui-kit';
import { useProduct } from '../hooks/use-product';
import { UnitsEditor } from './UnitsEditor';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  addUnit: vi.fn(),
  updateUnit: vi.fn(),
  archiveUnit: vi.fn(),
  can: (_permission: string): boolean => true,
}));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: (permission: string) => mocks.can(permission),
}));
vi.mock('../../module', () => ({
  useProductsModule: () => ({
    products: {
      get: mocks.get,
      addUnit: mocks.addUnit,
      updateUnit: mocks.updateUnit,
      archiveUnit: mocks.archiveUnit,
      list: vi.fn(),
    },
  }),
}));

type Unit = Dto<'StoreProductUnitDto'>;
const unit = (over: Partial<Unit>): Unit => ({
  id: 'u',
  catalogItemUnitId: null,
  name: 'واحد',
  baseQty: '1',
  salePriceAmount: null,
  effectivePriceAmount: null,
  isSellable: true,
  isPurchasable: true,
  barcodes: [],
  archivedAt: null,
  isBase: false,
  ...over,
});
const piece = unit({
  id: 'u0',
  catalogItemUnitId: 'c0',
  name: 'عدد',
  effectivePriceAmount: '10000',
  isBase: true,
});
const pack = unit({
  id: 'u1',
  name: 'بسته ۲۰تایی',
  baseQty: '20',
  salePriceAmount: '190000',
  effectivePriceAmount: '190000',
});
const carton = unit({
  id: 'u2',
  name: 'کارتن',
  baseQty: '240',
  isSellable: false,
  effectivePriceAmount: '2400000',
});
const old = unit({ id: 'u3', name: 'بسته قدیمی', baseQty: '12', archivedAt: '2026-10-01T08:00:00Z' });
const product = (units: Unit[], version = 3) =>
  ({
    id: 'p1',
    title: 'خودکار بیک',
    kind: 'Goods',
    status: 'Active',
    version,
    baseUnitName: 'عدد',
    baseUnitMaxDecimals: 0,
    baseSalePriceAmount: '10000',
    units,
  }) as unknown as Dto<'StoreProductDto'>;

const onClose = vi.fn();
function Host() {
  const p = useProduct('p1').data;
  return p ? <UnitsEditor product={p} onClose={onClose} /> : null;
}
const renderEditor = async () => {
  render(
    <DataProvider client={createDataClient()}>
      <ViewportProvider forced="desktop">
        <Host />
      </ViewportProvider>
    </DataProvider>,
  );
  await screen.findByText('واحدهای این کالا');
};
const field = (label: RegExp) => screen.getByLabelText(label);
const save = () => act(async () => fireEvent.click(screen.getByRole('button', { name: 'ذخیره' })));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.can = () => true;
  mocks.get.mockResolvedValue(product([piece, pack, carton, old]));
});

describe('units and packs of a product (UNIT-01, F12 §2–§9)', () => {
  it('lists each unit with its factor, uses and server price; a retired one only for records', async () => {
    await renderEditor();
    expect(
      screen.getByText(/هر بسته ۲۰تایی = ۲۰ عدد · خرید و فروش · قیمت فروش: ۱۹۰٬۰۰۰ تومان/),
    ).toBeInTheDocument();
    expect(screen.getByText(/هر کارتن = ۲۴۰ عدد · فقط خرید$/)).toBeInTheDocument(); // no price on a purchase unit
    expect(screen.getByText('برای سوابق')).toBeInTheDocument();
    const retired = screen.getByText('بسته قدیمی').closest('div')!.parentElement!;
    expect(within(retired).queryByRole('button')).toBeNull();
    // the base unit is never archived: three active units, two of them archivable
    expect(screen.getAllByRole('button', { name: 'بایگانی' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'ویرایش' })).toHaveLength(3);
  });

  it('adds a unit with its own uses, refusing what the server would refuse', async () => {
    mocks.addUnit.mockResolvedValue(
      product(
        [piece, pack, carton, unit({ id: 'u4', name: 'بسته ۱۰تایی', baseQty: '10', isSellable: false }), old],
        4,
      ),
    );
    await renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'افزودن واحد یا بسته' }));
    fireEvent.change(field(/^نام واحد/), { target: { value: 'عدد' } });
    fireEvent.change(field(/^تعداد عدد در هر واحد/), { target: { value: '10.5' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'قابل خرید' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'قابل فروش' }));
    await save();
    expect(screen.getByText('واحدی با همین نام برای این کالا ثبت شده است.')).toBeInTheDocument();
    expect(field(/^تعداد عدد در هر واحد/)).toHaveAttribute('aria-invalid', 'true'); // a count base takes whole sizes
    fireEvent.change(field(/^تعداد عدد در هر واحد/), { target: { value: '10' } });
    await save();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'واحد باید دست‌کم برای خرید یا فروش قابل استفاده باشد.',
    );
    expect(mocks.addUnit).not.toHaveBeenCalled();

    fireEvent.change(field(/^نام واحد/), { target: { value: 'بسته ۱۰تایی' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'قابل خرید' }));
    await save();
    expect(mocks.addUnit).toHaveBeenCalledTimes(1);
    expect(mocks.addUnit).toHaveBeenCalledWith(
      'store',
      'p1',
      {
        name: 'بسته ۱۰تایی',
        baseQty: '10',
        salePriceAmount: null,
        barcode: null,
        isSellable: false,
        isPurchasable: true,
        expectedVersion: 3,
      },
      expect.any(String),
    );
    // back on the list with the server's product
    expect(await screen.findByText(/هر بسته ۱۰تایی = ۱۰ عدد · فقط خرید/)).toBeInTheDocument();
  });

  it('keeps the input on a stale version and saves again with the fresh one', async () => {
    mocks.addUnit.mockRejectedValueOnce(appError('Conflict', 'VERSION_CONFLICT', 'Changed'));
    await renderEditor();
    mocks.get.mockResolvedValue(product([piece, pack, carton, old], 5));
    fireEvent.click(screen.getByRole('button', { name: 'افزودن واحد یا بسته' }));
    fireEvent.change(field(/^نام واحد/), { target: { value: 'بسته ۱۰تایی' } });
    fireEvent.change(field(/^تعداد عدد در هر واحد/), { target: { value: '10' } });
    await save();
    expect(await screen.findByText('این کالا هم‌زمان تغییر کرده است')).toBeInTheDocument();
    expect(field(/^نام واحد/)).toHaveValue('بسته ۱۰تایی');
    await waitFor(() => expect(mocks.get.mock.calls.length).toBeGreaterThan(1)); // the fresh product
    mocks.addUnit.mockResolvedValueOnce(product([piece, pack, carton, old], 6));
    await save();
    expect(mocks.addUnit).toHaveBeenLastCalledWith(
      'store',
      'p1',
      expect.objectContaining({ expectedVersion: 5 }),
      expect.any(String),
    );
    // a new action after a refusal is a new operation
    expect(mocks.addUnit.mock.calls[0]![3]).not.toBe(mocks.addUnit.mock.calls[1]![3]);
  });

  it('edits price and uses only; name and factor stay as they were', async () => {
    mocks.updateUnit.mockResolvedValue(
      product([piece, { ...pack, salePriceAmount: '185000' }, carton, old], 4),
    );
    await renderEditor();
    fireEvent.click(screen.getAllByRole('button', { name: 'ویرایش' })[1]!);
    expect(screen.queryByLabelText(/^نام واحد/)).toBeNull();
    expect(screen.getByText('نام و ضریب')).toBeInTheDocument();
    fireEvent.change(field(/^قیمت فروش هر واحد/), { target: { value: '185000' } });
    await save();
    expect(mocks.updateUnit).toHaveBeenCalledWith(
      'store',
      'p1',
      'u1',
      { salePriceAmount: '185000', isSellable: true, isPurchasable: true, expectedVersion: 3 },
      expect.any(String),
    );
  });

  it('archives after a confirmation that names the effect on records', async () => {
    mocks.archiveUnit.mockResolvedValue(
      product([piece, carton, { ...pack, archivedAt: '2026-10-19T08:00:00Z' }, old], 4),
    );
    await renderEditor();
    fireEvent.click(screen.getAllByRole('button', { name: 'بایگانی' })[0]!);
    const dialog = screen.getAllByRole('dialog').at(-1)!;
    expect(within(dialog).getByText('بایگانی «بسته ۲۰تایی»؟')).toBeInTheDocument();
    expect(within(dialog).getByText(/اسناد قبلی با همین نام و ضریب می‌مانند/)).toBeInTheDocument();
    await act(async () => fireEvent.click(within(dialog).getByRole('button', { name: 'بایگانی' })));
    expect(mocks.archiveUnit).toHaveBeenCalledWith('store', 'p1', 'u1', 3, expect.any(String));
    await waitFor(() => expect(screen.getAllByText('برای سوابق')).toHaveLength(2));
  });

  it('offers only what the member may do', async () => {
    mocks.can = (permission) => permission === 'price.change';
    await renderEditor();
    expect(screen.queryByRole('button', { name: 'افزودن واحد یا بسته' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'بایگانی' })).toBeNull();
    expect(screen.getAllByRole('button', { name: 'ویرایش' })).toHaveLength(3);
  });
});
