import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { DataProvider, createDataClient } from '@dukani/data';
import { decimal, money } from '@dukani/domain';
import type * as Platform from '@dukani/platform';
import { ViewportProvider } from '@dukani/ui-kit';
import { newDraft } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { PricingForm } from './PricingForm';
import { StockForm } from './StockForm';

const mocks = vi.hoisted(() => ({ hostRenders: 0 }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
}));
vi.mock('../hooks/use-entry-nav', () => ({
  useEntryNav: () => ({
    storeId: 'store',
    back: vi.fn(),
    step: vi.fn(),
    nav: { push: vi.fn(), replace: vi.fn() },
  }),
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({ analytics: { track: vi.fn() }, catalog: { suppliers: async () => [] } }),
}));
// rendered by each step with props that never change: counts the renders of the step itself
vi.mock('./EntryWorkflow', () => ({
  EntryWorkflow: () => {
    mocks.hostRenders++;
    return null;
  },
}));

/** A pen sold by the piece and by a pack of 20, bought at 160,000 a pack (8,000 a piece). */
const pen = (): EntryDraft => {
  const draft = newDraft('d1', { source: 'new', title: 'خودکار' });
  return {
    ...draft,
    newItem: {
      ...draft.newItem!,
      baseUnitName: 'عدد',
      packagings: [{ name: 'بسته', baseQty: decimal.of(20) }],
    },
    stock: {
      kind: 'Opening',
      unitKey: 'pack:1',
      quantity: decimal.of(3),
      costStatus: 'Known',
      unitCost: money(160000),
      supplierId: null,
      supplierName: null,
      supplierInvoiceNo: '',
      productionDate: null,
      expiryDate: null,
    },
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
      <ViewportProvider forced="desktop">{ui}</ViewportProvider>
    </DataProvider>,
  );
const typeInto = (label: RegExp, values: readonly string[]) => {
  for (const value of values) fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

beforeEach(() => {
  mocks.hostRenders = 0;
});

describe('pricing step (F10)', () => {
  it('follows the typed price in its leaves and keeps the raw input without re-rendering the step', async () => {
    const drafts = store(pen());
    const view = wrap(<PricingForm draft={drafts.current()} save={drafts.save} />);
    // the pack price input names the price it follows when left empty: 20 × 25% on 8,000 a piece
    expect(screen.getByText(/خالی بماند، ۲۰۰٬۰۰۰ تومان/)).toBeInTheDocument();
    const afterMount = mocks.hostRenders;
    typeInto(/درصد افزوده/, ['5', '50']);
    expect(screen.getByText(/خالی بماند، ۲۴۰٬۰۰۰ تومان/)).toBeInTheDocument();
    expect(mocks.hostRenders - afterMount).toBeLessThanOrEqual(1); // the dirty flip only
    await waitFor(() => expect(drafts.current().pricingEditor?.markupPercent).toBe('50'));
    expect(drafts.save).toHaveBeenCalledTimes(2); // the first change at once, the rest of the burst once
    typeInto(/درصد افزوده/, ['50.']); // unfinished: kept as typed for a refresh
    view.unmount(); // leaving the step flushes it
    await act(async () => undefined);
    expect(drafts.current().pricingEditor?.markupPercent).toBe('50.');
    wrap(<PricingForm draft={drafts.current()} save={drafts.save} />);
    expect(screen.getByLabelText(/درصد افزوده/)).toHaveValue('۵۰٫');
  });
});

describe('stock step (F10)', () => {
  it('previews the conversion of the typed quantity and keeps it without re-rendering the step', async () => {
    const drafts = store(pen());
    const view = wrap(
      <StockForm draft={drafts.current()} kind="Opening" save={drafts.save} onChangeOrigin={vi.fn()} />,
    );
    expect(screen.getByText('۳ بسته × ۲۰ = ۶۰ عدد')).toBeInTheDocument();
    const afterMount = mocks.hostRenders;
    typeInto(/^تعداد/, ['1', '12']);
    expect(screen.getByText('۱۲ بسته × ۲۰ = ۲۴۰ عدد')).toBeInTheDocument();
    expect(mocks.hostRenders - afterMount).toBeLessThanOrEqual(1);
    await waitFor(() => expect(drafts.current().stockEditor?.fields.quantity).toBe('12'));
    view.unmount();
    wrap(<StockForm draft={drafts.current()} kind="Opening" save={drafts.save} onChangeOrigin={vi.fn()} />);
    expect(screen.getByText('۱۲ بسته × ۲۰ = ۲۴۰ عدد')).toBeInTheDocument();
  });
});
