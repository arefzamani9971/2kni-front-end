import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { DataProvider, createDataClient } from '@dukani/data';
import type * as Platform from '@dukani/platform';
import { ViewportProvider } from '@dukani/ui-kit';
import { newDraft } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { CatalogCreationSlots } from './CatalogCreationSlots.types';
import { NewItemDetails } from './NewItemDetails';

const mocks = vi.hoisted(() => ({ hostRenders: 0, replace: vi.fn(), titleCheck: vi.fn() }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
  useCan: () => true,
}));
vi.mock('../common/hooks/use-entry-nav', () => ({
  useEntryNav: () => ({
    storeId: 'store',
    back: vi.fn(),
    step: vi.fn(),
    nav: { push: vi.fn(), replace: mocks.replace },
  }),
}));
vi.mock('../common/hooks/use-start-entry', () => ({ useStartEntry: () => ({ startFromCatalog: vi.fn() }) }));
// rendered by the details form with props that never change: counts the renders of the form itself
vi.mock('./EntryKindSection', () => ({
  EntryKindSection: () => {
    mocks.hostRenders++;
    return null;
  },
}));
const unit = {
  id: 'piece',
  key: 'piece',
  name: 'عدد',
  symbol: '',
  dimension: 'Count',
  factorToBase: '1',
  maxDecimals: 0,
};
const productType = {
  id: 'pt',
  name: 'خودکار',
  measureDimension: 'Count',
  defaultBaseUnit: unit,
  allowedUnits: [unit],
  allowDecimalQuantity: false,
  defaultPackagings: [],
  schemaVersion: 3,
  status: 'Public',
  attributes: [
    {
      attributeId: 'color',
      key: 'color',
      name: 'رنگ',
      dataType: 'Text',
      isRequired: false,
      isVariantAxis: false,
      sort: 0,
      options: [],
    },
  ],
};
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({
    analytics: { track: vi.fn() },
    drafts: { remove: vi.fn() },
    catalog: {
      productTypes: async () => [],
      productType: async () => productType,
      brands: async () => [],
      units: async () => [],
      titleCheck: mocks.titleCheck,
    },
  }),
}));

/** Longer than the autosave quiet time that ends a burst of edits. */
const QUIET_MS = 600;
const creators: CatalogCreationSlots = {
  brand: ({ initialName, present, onCancel }) => present(<p>{`فرم برند ${initialName}`}</p>, null, onCancel),
};
const preset = { id: 'pt', name: 'خودکار', baseUnit: { id: 'piece', name: 'عدد', maxDecimals: 0 } };
/** The stored draft and its save: `failing` makes the next writes report a failed persistence. */
const store = () => {
  let draft: EntryDraft = { ...newDraft('d1', { source: 'new', productType: preset }), intent: 'standalone' };
  const state = { failing: false };
  const save = vi.fn(async (update: (d: EntryDraft) => EntryDraft) => {
    await Promise.resolve();
    if (state.failing) return null;
    draft = update(draft);
    return draft;
  });
  return { save, state, current: () => draft };
};
const show = (draft: EntryDraft, save: ReturnType<typeof store>['save']) =>
  render(
    <DataProvider client={createDataClient()}>
      <ViewportProvider forced="desktop">
        <NewItemDetails draft={draft} save={save} creators={creators} />
      </ViewportProvider>
    </DataProvider>,
  );
const title = () => screen.getByLabelText(/نام کامل و متمایز/);
const typeTitle = (values: readonly string[]) => {
  for (const value of values) fireEvent.change(title(), { target: { value } });
};
const editors = (save: ReturnType<typeof store>['save'], from: EntryDraft) =>
  save.mock.calls.map(([update]) => update(from).detailsEditor);

beforeEach(() => {
  mocks.hostRenders = 0;
  mocks.replace.mockReset();
  mocks.titleCheck
    .mockReset()
    .mockResolvedValue({ normalizedTitle: '', isAvailable: true, similarItems: [] });
});

describe('new item details autosave (F10)', () => {
  it('saves the typed title at once and the rest of the burst once, without re-rendering the details form', async () => {
    const drafts = store();
    const start = drafts.current();
    show(start, drafts.save);
    await screen.findByLabelText(/^رنگ/);
    // the loaded schema version is a change of its own: let that burst end before typing
    await waitFor(() => expect(drafts.save).toHaveBeenCalledTimes(1));
    await act(() => new Promise((resolve) => setTimeout(resolve, QUIET_MS)));
    drafts.save.mockClear();
    const afterLoad = mocks.hostRenders;
    expect(afterLoad).toBeGreaterThan(0);
    typeTitle(['خ', 'خو', 'خود', 'خودکار آبی']);
    expect(drafts.save).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(drafts.save).toHaveBeenCalledTimes(2));
    expect(editors(drafts.save, start).map((e) => e?.fields.title)).toEqual(['خ', 'خودکار آبی']);
    await act(async () => undefined);
    expect(mocks.hostRenders - afterLoad).toBeLessThanOrEqual(1); // the dirty flip only
  });

  it('opens an in-place creation only after the draft is saved; a failed save keeps it closed with a retry', async () => {
    const drafts = store();
    show(drafts.current(), drafts.save);
    await screen.findByLabelText(/^رنگ/);
    drafts.state.failing = true;
    typeTitle(['خودکار ناتمام']);
    expect(await screen.findByText(/ذخیرهٔ پیش‌نویس انجام نشد/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'برند را نمی‌دانم' }));
    await act(async () => undefined);
    expect(screen.queryByRole('dialog')).toBeNull(); // nothing opens over a draft that is not saved
    drafts.state.failing = false;
    fireEvent.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    await waitFor(() => expect(screen.queryByText(/ذخیرهٔ پیش‌نویس انجام نشد/)).toBeNull());
    expect(drafts.current().detailsEditor?.fields.title).toBe('خودکار ناتمام');
    fireEvent.click(screen.getByRole('button', { name: 'برند را نمی‌دانم' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'برند تازه' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'افزودن برند' }));
    expect(await screen.findByText('فرم برند برند تازه')).toBeInTheDocument();
    await waitFor(() =>
      expect(drafts.current().detailsEditor?.creation).toEqual({ kind: 'brand', name: 'برند تازه' }),
    );
  });

  it('a refresh brings back the unfinished input, attributes and the open creation', async () => {
    const drafts = store();
    const view = show(drafts.current(), drafts.save);
    fireEvent.change(await screen.findByLabelText(/^رنگ/), { target: { value: 'آبی' } });
    typeTitle(['خودکار نیمه']);
    await waitFor(() => expect(drafts.current().detailsEditor?.fields.title).toBe('خودکار نیمه'));
    await waitFor(() => expect(drafts.current().detailsEditor?.attributes).toEqual({ color: 'آبی' }));
    fireEvent.click(screen.getByRole('button', { name: 'برند را نمی‌دانم' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'برند نو' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'افزودن برند' }));
    await waitFor(() => expect(drafts.current().detailsEditor?.creation?.name).toBe('برند نو'));
    view.unmount();
    show(drafts.current(), drafts.save);
    expect(title()).toHaveValue('خودکار نیمه');
    expect(await screen.findByText('فرم برند برند نو')).toBeInTheDocument();
    expect(await screen.findByLabelText(/^رنگ/)).toHaveValue('آبی');
  });

  it('leaving waits for the draft: a failed save keeps the seller on the form', async () => {
    const drafts = store();
    show(drafts.current(), drafts.save);
    await screen.findByLabelText(/^رنگ/);
    drafts.state.failing = true;
    typeTitle(['خودکار رها']);
    fireEvent.click(screen.getAllByRole('button', { name: 'بازگشت' })[0]!);
    await act(async () => undefined);
    expect(mocks.replace).not.toHaveBeenCalled();
    drafts.state.failing = false;
    fireEvent.click(screen.getAllByRole('button', { name: 'بازگشت' })[0]!);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledTimes(1));
    expect(drafts.current().detailsEditor?.fields.title).toBe('خودکار رها');
  });

  it('a title already in the catalog closes the submit without re-rendering the form while typing', async () => {
    mocks.titleCheck.mockResolvedValue({
      normalizedTitle: 'خودکار بیک',
      isAvailable: false,
      similarItems: [],
    });
    const drafts = store();
    show(drafts.current(), drafts.save);
    await screen.findByLabelText(/^رنگ/);
    typeTitle(['خودکار بیک']);
    await waitFor(() =>
      expect(mocks.titleCheck).toHaveBeenCalledWith('store', 'خودکار بیک', expect.anything()),
    );
    await act(async () => undefined);
    fireEvent.click(screen.getAllByRole('button', { name: 'بررسی و ادامه' })[0]!);
    expect(await screen.findByText(/کالایی با همین عنوان هست/)).toBeInTheDocument();
  });
});
