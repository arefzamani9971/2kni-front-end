import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { DataProvider, createDataClient } from '@dukani/data';
import { decimal, money } from '@dukani/domain';
import type * as Platform from '@dukani/platform';
import { ViewportProvider } from '@dukani/ui-kit';
import { newDraft } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { PricingForm } from '../pricing/components/PricingForm';
import { StockForm } from '../stock/components/StockForm';
import { UnitsForm } from '../units/components/UnitsForm';

const mocks = vi.hoisted(() => ({ step: vi.fn() }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
}));
vi.mock('../common/hooks/use-entry-nav', () => ({
  useEntryNav: () => ({
    storeId: 'store',
    back: vi.fn(),
    step: mocks.step,
    nav: { push: vi.fn(), replace: vi.fn() },
  }),
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({ analytics: { track: vi.fn() }, catalog: { suppliers: async () => [] } }),
}));

/** A new pen sold by the piece (10,000) and by a pack of 20. */
const pen = (over: Partial<EntryDraft> = {}): EntryDraft => {
  const draft = newDraft('d1', { source: 'new', title: 'خودکار' });
  return {
    ...draft,
    intent: 'compound',
    newItem: {
      ...draft.newItem!,
      baseUnitName: 'عدد',
      baseUnitMaxDecimals: 0,
      packagings: [{ name: 'بسته ۲۰تایی', baseQty: decimal.of(20), isSellable: true, isPurchasable: true }],
    },
    pricing: {
      method: 'Manual',
      manualPrice: money(10000),
      markupPercent: null,
      fixedProfit: null,
      roundingStep: null,
    },
    ...over,
  };
};
const store = (initial: EntryDraft) => {
  let draft = initial;
  const save = vi.fn(async (update: (d: EntryDraft) => EntryDraft) => {
    await Promise.resolve();
    draft = update(draft);
    return draft;
  });
  return { save, current: () => draft };
};
const wrap = (ui: React.ReactNode) =>
  render(
    <DataProvider client={createDataClient()}>
      <ViewportProvider forced="mobile">{ui}</ViewportProvider>
    </DataProvider>,
  );

beforeEach(() => vi.clearAllMocks());

describe('package price on the pricing step (F12 §10, scenario 10)', () => {
  it('keeps 190,000 for the pack instead of 20 × 10,000 and refuses a zero price', async () => {
    const drafts = store(pen());
    wrap(<PricingForm draft={drafts.current()} save={drafts.save} />);
    const packPrice = screen.getByLabelText(/^قیمت فروش هر بسته ۲۰تایی/);
    expect(screen.getByText(/خالی بماند، ۲۰۰٬۰۰۰ تومان/)).toBeInTheDocument(); // what it follows when empty
    fireEvent.change(packPrice, { target: { value: '0' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'ادامه' })));
    expect(screen.getByText('قیمت بسته باید بیشتر از صفر باشد.')).toBeInTheDocument();
    expect(drafts.current().unitPrices).toBeUndefined();

    fireEvent.change(packPrice, { target: { value: '190000' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'ادامه' })));
    await waitFor(() => expect(mocks.step).toHaveBeenCalled());
    expect(drafts.current().unitPrices).toEqual([
      { unitKey: 'pack:1', name: 'بسته ۲۰تایی', baseQty: '20', price: money(190000) },
    ]);
  });

  it('offers no price input for a purchase-only pack', () => {
    const drafts = store(
      pen({
        newItem: {
          ...pen().newItem!,
          packagings: [{ name: 'کارتن', baseQty: decimal.of(240), isSellable: false, isPurchasable: true }],
        },
      }),
    );
    wrap(<PricingForm draft={drafts.current()} save={drafts.save} />);
    expect(screen.queryByLabelText(/^قیمت فروش هر کارتن/)).toBeNull();
  });
});

describe('stock unit (F12 §6, §12, AC07)', () => {
  it('asks again for a unit the draft no longer offers instead of falling back to the base unit', async () => {
    const drafts = store(
      pen({
        stockDecided: true,
        stock: {
          kind: 'Opening',
          unitKey: 'pack:9',
          quantity: decimal.of(3),
          costStatus: 'Unknown',
          unitCost: null,
          supplierId: null,
          supplierName: null,
          supplierInvoiceNo: '',
          productionDate: null,
          expiryDate: null,
        },
      }),
    );
    wrap(<StockForm draft={drafts.current()} kind="Opening" save={drafts.save} onChangeOrigin={vi.fn()} />);
    expect(screen.getByText('واحد خرید باید دوباره انتخاب شود')).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /ادامه با بهای نامعلوم/ })));
    expect(mocks.step).not.toHaveBeenCalled();
    expect(drafts.current().stock?.unitKey).toBe('pack:9'); // nothing was replaced behind the seller's back
  });
});

describe('packages of a new item (F12 §5)', () => {
  it('refuses a package with no use and a name already taken', async () => {
    const drafts = store(pen());
    wrap(<UnitsForm draftId="d1" item={drafts.current().newItem!} save={drafts.save} />);
    fireEvent.change(screen.getByLabelText(/^نام بسته/), { target: { value: 'عدد' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'قابل فروش' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'قابل خرید' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /ادامه به موجودی/ })));
    expect(screen.getByText('این نام برای واحد دیگری از همین کالا ثبت شده است.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^نام بسته/), { target: { value: 'بسته ۲۰تایی' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /ادامه به موجودی/ })));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'بسته باید دست‌کم برای خرید یا فروش قابل استفاده باشد.',
    );
    expect(mocks.step).not.toHaveBeenCalled();
  });
});
