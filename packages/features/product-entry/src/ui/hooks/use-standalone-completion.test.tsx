import { act, renderHook } from '@testing-library/react';
import { newDraft } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useStandaloneCompletion } from './use-standalone-completion';

const mocks = vi.hoisted(() => ({ save: vi.fn(), prepare: vi.fn(), replace: vi.fn(), step: vi.fn() }));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('../../module', () => ({ useProductEntryModule: () => ({ drafts: { save: mocks.save } }) }));
vi.mock('./use-start-entry', () => ({ useStartEntry: () => ({ prepareCatalog: mocks.prepare }) }));
vi.mock('./use-entry-nav', () => ({
  useEntryNav: () => ({ step: mocks.step, nav: { replace: mocks.replace } }),
}));
const draft: EntryDraft = {
  ...newDraft('identity', { source: 'new', title: 'Pen' }),
  intent: 'standalone',
  result: {
    storeProductId: 'product',
    catalogItemId: 'catalog',
    catalogItemCreated: true,
    purchaseId: null,
    sku: '1',
    onHand: '0',
    salePriceAmount: null,
    itemKind: 'Goods',
    catalogStatus: 'Private',
    storeProductStatus: 'Active',
    version: 1,
    title: 'Pen',
    baseUnitName: 'piece',
  },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.prepare.mockResolvedValue({
    id: 'stock-draft',
    source: 'catalog',
    catalog: { storeProductId: 'product' },
  });
  mocks.save.mockImplementation(async (_store, value) => value);
});
it('not now leaves without creating a receipt or another draft', async () => {
  const { result } = renderHook(() => useStandaloneCompletion(draft));
  await act(() => result.current.complete(false));
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.prepare).not.toHaveBeenCalled();
  expect(mocks.replace).toHaveBeenCalledWith('/s/store/products');
});
it('starts stock from the committed membership and coalesces double clicks', async () => {
  const { result } = renderHook(() => useStandaloneCompletion(draft));
  await act(() => Promise.all([result.current.complete(true), result.current.complete(true)]));
  expect(mocks.prepare).toHaveBeenCalledExactlyOnceWith('catalog', 'product');
  expect(mocks.save).toHaveBeenCalledWith(
    'store',
    expect.objectContaining({ intent: 'compound', source: 'catalog' }),
  );
  expect(mocks.step).toHaveBeenCalledExactlyOnceWith('stock-draft', 'stock', true);
});
it('returns the committed product to the original purchase without registering it again', async () => {
  const { result } = renderHook(() => useStandaloneCompletion({ ...draft, purchaseHostId: 'receipt' }));
  await act(() => result.current.complete(false));
  expect(mocks.replace).toHaveBeenCalledWith('/s/store/purchases/receipt/lines?productId=product');
  expect(mocks.prepare).not.toHaveBeenCalled();
});
it('keeps the confirmed identity when saving the optional stock draft fails', async () => {
  mocks.save.mockRejectedValue(new Error('storage'));
  const { result } = renderHook(() => useStandaloneCompletion(draft));
  await act(() => result.current.complete(true));
  expect(result.current.error).toBe(true);
  expect(mocks.step).not.toHaveBeenCalled();
  await act(() => result.current.complete(false));
  expect(mocks.replace).toHaveBeenCalledWith('/s/store/products');
});
