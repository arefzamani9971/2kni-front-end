import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError, decimal } from '@dukani/domain';
import type * as Platform from '@dukani/platform';
import { emptyBulkDraft, type BulkDraft } from '../../domain/bulk-draft';
import { newDraft, toRegisterRequest } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { Review } from './Review';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  registerRequest: vi.fn(),
  track: vi.fn(),
  bulkGet: vi.fn(),
  bulkUpdate: vi.fn(),
  step: vi.fn(),
  push: vi.fn(),
}));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<typeof Platform>()),
  useActiveStore: () => ({ id: 'store', name: 'دکان' }),
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({
    commands: { preview: mocks.preview, registerRequest: mocks.registerRequest },
    analytics: { track: mocks.track },
    bulkDrafts: { get: mocks.bulkGet, update: mocks.bulkUpdate },
  }),
}));
vi.mock('../hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ step: mocks.step, back: vi.fn(), nav: { push: mocks.push, replace: vi.fn() } }),
}));
vi.mock('./EntryReviewShell', () => ({
  EntryReviewShell: ({
    title,
    actions,
    children,
  }: {
    title: ReactNode;
    actions: ReactNode;
    children: ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      {children}
      {actions}
    </main>
  ),
}));
vi.mock('./ReviewSummary', () => ({ ReviewSummary: () => null }));
vi.mock('./UnitReselectAlert', () => ({ UnitReselectAlert: () => <p>reselect the unit</p> }));

const base: EntryDraft = {
  ...newDraft('draft-1', { source: 'new', title: 'خودکار آبی' }),
  intent: 'compound',
};
const result = { storeProductId: 'product', catalogItemId: 'item' };
let stored: EntryDraft;
let bulk: BulkDraft;
const save = vi.fn(async (update: (d: EntryDraft) => EntryDraft) => (stored = update(stored)));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  stored = base;
  bulk = emptyBulkDraft();
  save.mockClear();
  mocks.preview
    .mockReset()
    .mockResolvedValue({ salePriceAmount: null, titleCheck: { isAvailable: true }, warnings: [] });
  mocks.registerRequest.mockReset().mockResolvedValue(result);
  mocks.track.mockReset();
  mocks.bulkGet.mockReset().mockImplementation(async () => bulk);
  mocks.bulkUpdate
    .mockReset()
    .mockImplementation(async (_store: string, transform: (d: BulkDraft) => BulkDraft) => {
      bulk = transform(bulk);
      return bulk;
    });
  mocks.step.mockReset();
  mocks.push.mockReset();
});
afterEach(() => vi.useRealTimers());

const show = (draft: EntryDraft) => {
  stored = draft;
  return render(
    <DataProvider client={createDataClient()}>
      <Review draft={draft} save={save} />
    </DataProvider>,
  );
};
const confirm = () => screen.getByRole('button', { name: 'تأیید و ثبت' });
const ready = () => waitFor(() => expect(confirm()).toBeEnabled());
const events = () => mocks.track.mock.calls.map(([event]) => event);

describe('entry review (F10): preview, idempotent register, bulk entry and recovery', () => {
  it('«تأیید» freezes the request and its operation id in the draft first, then registers once', async () => {
    show(base);
    await ready();
    fireEvent.click(confirm());
    fireEvent.click(confirm());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.registerRequest).toHaveBeenCalledTimes(1);
    const [storeId, body, operationId] = mocks.registerRequest.mock.calls[0]!;
    expect(storeId).toBe('store');
    expect(body).toEqual(toRegisterRequest(base));
    expect(save.mock.invocationCallOrder[0]).toBeLessThan(mocks.registerRequest.mock.invocationCallOrder[0]!);
    // the frozen operation id stays on the draft; the answer replaces the frozen request
    expect(stored.operationId).toBe(operationId);
    expect(stored.pending).toBeUndefined();
    expect(stored.result).toMatchObject({ ...result, title: 'خودکار آبی' });
    expect(mocks.step).toHaveBeenCalledWith('draft-1', 'done', true);
    expect(events()).toEqual([
      { eventName: 'submit_started', flowId: 'F10' },
      { eventName: 'submit_result', flowId: 'F10', outcome: 'success', durationMs: expect.any(Number) },
    ]);
  });

  it('inside bulk entry «تأیید» adds the item to the bulk draft once and opens bulk entry, without registering', async () => {
    show({ ...base, bulkHost: true });
    await ready();
    fireEvent.click(confirm());
    fireEvent.click(confirm());
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.bulkUpdate).toHaveBeenCalledTimes(1);
    expect(bulk.rows).toHaveLength(1);
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push.mock.calls[0]?.[0]).toContain('/entry/bulk');
    expect(mocks.registerRequest).not.toHaveBeenCalled();
  });

  it('a request frozen before a refresh is checked again with the same body and id; a refusal releases it', async () => {
    const frozen: EntryDraft = {
      ...base,
      operationId: 'op-1',
      pending: { operationId: 'op-1', body: toRegisterRequest(base) },
    };
    mocks.registerRequest.mockRejectedValue(appError('Validation', 'TITLE_DUPLICATE', 'تکراری'));
    show(frozen);
    expect(confirm()).toBeDisabled();
    fireEvent.click(await screen.findByRole('button', { name: 'بررسی دوباره' }));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(mocks.registerRequest).toHaveBeenCalledWith('store', frozen.pending!.body, 'op-1');
    expect(await screen.findByText('ثبت انجام نشد')).toBeInTheDocument();
    // the seller may change the entry now: the frozen request is released in the draft
    await waitFor(() => expect(stored.pending).toBeUndefined());
    expect(events()).toEqual([
      { eventName: 'recovery_used', flowId: 'F10' },
      { eventName: 'submit_started', flowId: 'F10' },
      { eventName: 'submit_result', flowId: 'F10', outcome: 'failed', errorCode: 'TITLE_DUPLICATE' },
    ]);
  });

  it('a lost response becomes unknown after one silent replay; «بررسی دوباره» asks with the same operation id', async () => {
    mocks.registerRequest.mockRejectedValue(appError('Unknown', 'NETWORK', 'قطع'));
    show(base);
    await ready();
    fireEvent.click(confirm());
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(mocks.registerRequest).toHaveBeenCalledTimes(2);
    fireEvent.click(await screen.findByRole('button', { name: 'بررسی دوباره' }));
    await act(() => vi.advanceTimersByTimeAsync(0));
    const ids = mocks.registerRequest.mock.calls.map((call) => call[2]);
    expect(new Set(ids).size).toBe(1);
    expect(events().slice(0, 3)).toEqual([
      { eventName: 'submit_started', flowId: 'F10' },
      { eventName: 'submit_started', flowId: 'F10' },
      { eventName: 'submit_result', flowId: 'F10', outcome: 'unknown' },
    ]);
    expect(events()[3]).toEqual({ eventName: 'recovery_used', flowId: 'F10' });
  });

  it('a stock unit the draft no longer offers is chosen again before any preview (F12 AC07)', async () => {
    const stale: EntryDraft = {
      ...base,
      stock: {
        kind: 'Opening',
        unitKey: 'pack:9',
        quantity: decimal.of('3'),
        costStatus: 'Unknown',
        unitCost: null,
        supplierId: null,
        supplierName: null,
        supplierInvoiceNo: '',
        productionDate: null,
        expiryDate: null,
        manufacturerPrice: null,
        printedPrice: null,
      },
    };
    show(stale);
    expect(await screen.findByText('reselect the unit')).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(confirm()).toBeDisabled();
  });
});
