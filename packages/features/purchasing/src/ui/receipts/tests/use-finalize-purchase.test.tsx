import { act, renderHook } from '@testing-library/react';
import { createDataClient, DataProvider, useQueryCache } from '@dukani/data';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type { ReactNode } from 'react';
import { useFinalizePurchase } from '../hooks/use-finalize-purchase';

const mocks = vi.hoisted(() => ({ save: vi.fn(), finalize: vi.fn(), invalidate: vi.fn() }));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('../../../module', () => ({
  usePurchasingModule: () => ({ purchases: { updateDraft: mocks.save, finalize: mocks.finalize } }),
}));
const purchase = {
  id: 'receipt',
  version: 1,
  status: 'Draft',
  discountAmount: '0',
  shippingAmount: '0',
  nonRecoverableTaxAmount: '0',
  purchasedAt: '2026-10-20T12:00:00Z',
  lines: [],
} as unknown as Dto<'PurchaseDto'>;
const intent = {
  amounts: { discountAmount: '10', shippingAmount: '0', nonRecoverableTaxAmount: '0' },
  confirm: false,
  reason: null,
};
const saved = { ...purchase, ...intent.amounts, version: 2 };
const completed = { ...saved, status: 'Finalized' } as Dto<'PurchaseDto'>;
function setup(onSuccess = vi.fn()) {
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DataProvider client={client}>{children}</DataProvider>
  );
  return {
    ...renderHook((draft) => useFinalizePurchase(draft, onSuccess), { wrapper, initialProps: purchase }),
    client,
    wrapper,
    onSuccess,
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.save.mockResolvedValue(saved);
  mocks.finalize.mockResolvedValue(completed);
});

it('saves once and finalizes the returned version under concurrent clicks', async () => {
  const { result, onSuccess } = setup();
  await act(async () => {
    await Promise.all([result.current.submit(intent), result.current.submit(intent)]);
  });
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.save.mock.calls[0]![2].expectedVersion).toBe(1);
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
  expect(mocks.finalize.mock.calls[0]![2].expectedVersion).toBe(2);
  expect(onSuccess).toHaveBeenCalledTimes(1);
  await act(() => result.current.submit(intent));
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
});
it('does not save an unchanged draft', async () => {
  const { result } = setup();
  await act(() =>
    result.current.submit({ ...intent, amounts: { ...intent.amounts, discountAmount: '0.00' } }),
  );
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.finalize.mock.calls[0]![2].expectedVersion).toBe(1);
});
it.each(['VERSION_CONFLICT', 'VALIDATION_FAILED', 'NETWORK_ERROR'])(
  'never finalizes after a failed save (%s)',
  async (code) => {
    mocks.save.mockRejectedValueOnce(
      appError(code === 'NETWORK_ERROR' ? 'Unknown' : 'Conflict', code, 'failed'),
    );
    const { result } = setup();
    await act(() => result.current.submit(intent));
    expect(result.current.saveError?.code).toBe(code);
    expect(mocks.finalize).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(false);
    await act(() => result.current.submit(intent));
    expect(mocks.save.mock.calls[1]![2].expectedVersion).toBe(1);
    expect(mocks.finalize.mock.calls[0]![2].expectedVersion).toBe(2);
  },
);
it('keeps the saved version after definitive failure; duplicate confirmation is a new operation', async () => {
  mocks.finalize.mockRejectedValueOnce(appError('Conflict', 'PURCHASE_DUPLICATE_INVOICE', 'duplicate'));
  const { result } = setup();
  await act(() => result.current.submit(intent));
  expect(result.current.state.kind).toBe('failed');
  await act(() => result.current.submit({ ...intent, confirm: true, reason: 'Different invoice' }));
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.finalize.mock.calls[1]![2]).toEqual({
    expectedVersion: 2,
    confirmDuplicateInvoiceNo: true,
    duplicateReason: 'Different invoice',
  });
  expect(mocks.finalize.mock.calls[1]![3]).not.toBe(mocks.finalize.mock.calls[0]![3]);
});
it('does not silently rebase a VERSION_CONFLICT onto newer props', async () => {
  mocks.finalize.mockRejectedValueOnce(appError('Conflict', 'VERSION_CONFLICT', 'changed'));
  const { result, rerender } = setup();
  await act(() => result.current.submit(intent));
  rerender({ ...purchase, version: 99 });
  await act(() => result.current.submit(intent));
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.finalize.mock.calls[1]![2].expectedVersion).toBe(2);
});
it('locks unknown results and retries the exact version/body/key without saving again', async () => {
  mocks.finalize.mockRejectedValueOnce(appError('Unknown', 'ABORTED', 'answer lost'));
  const { result } = setup();
  await act(() => result.current.submit(intent));
  expect(result.current.state.kind).toBe('unknown');
  expect(result.current.locked).toBe(true);
  await act(() => result.current.submit({ ...intent, amounts: { ...intent.amounts, discountAmount: '30' } }));
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
  await act(async () => {
    await Promise.all([result.current.retry(), result.current.retry()]);
  });
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.finalize.mock.calls[1]).toEqual(mocks.finalize.mock.calls[0]);
  expect(result.current.state.kind).toBe('succeeded');
});
it('keeps success when navigation or toast fails and prevents a second finalization', async () => {
  const { result } = setup(
    vi.fn(() => {
      throw new Error('navigation failed');
    }),
  );
  await act(() => result.current.submit(intent));
  expect(result.current.state.kind).toBe('succeeded');
  expect(result.current.completionErrors[0]!.phase).toBe('onSuccess');
  await act(() => result.current.submit(intent));
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
});
it('silently replays a lost response once, then recovers with the same operation', async () => {
  mocks.finalize
    .mockRejectedValueOnce(appError('Unknown', 'NETWORK', 'lost'))
    .mockRejectedValueOnce(appError('Unknown', 'NETWORK', 'lost again'));
  const { result } = setup();
  await act(() => result.current.submit(intent));
  expect(result.current.state.kind).toBe('unknown');
  expect(mocks.finalize.mock.calls[1]).toEqual(mocks.finalize.mock.calls[0]);
  await act(() => result.current.retry());
  expect(mocks.finalize.mock.calls[2]).toEqual(mocks.finalize.mock.calls[0]);
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(result.current.state.kind).toBe('succeeded');
});
it('keeps success when invalidation fails', async () => {
  const { result, wrapper, onSuccess } = setup();
  const { result: cache } = renderHook(() => useQueryCache(), { wrapper });
  cache.current.set(['purchases', 'store'], purchase);
  const unsubscribe = cache.current.subscribe(['purchases', 'store'], () => {
    throw new Error('cache observer failed');
  });
  await act(() => result.current.submit(intent));
  expect(result.current.state.kind).toBe('succeeded');
  unsubscribe();
  expect(result.current.completionErrors[0]!.phase).toBe('invalidation');
  expect(onSuccess).toHaveBeenCalledTimes(1);
  await act(() => result.current.submit(intent));
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
});
