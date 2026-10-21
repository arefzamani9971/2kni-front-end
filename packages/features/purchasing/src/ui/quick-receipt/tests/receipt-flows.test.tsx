import { act, renderHook, waitFor } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { I18nProvider } from '@dukani/i18n';
import { appError, decimal, money } from '@dukani/domain';
import type { ReactNode } from 'react';
import type { ContinuousDraft } from '../../../domain/continuous-purchase.types';
import { createOpeningQueue } from '../../../domain/opening-queue';
import type { OpeningQueue } from '../../../domain/opening-queue.types';
import type { ReceiptFormOutput } from '../../../domain/receipt-form.types';
import type { QuickReceipt, RecordedReceipt } from '../../../domain/receipt.types';
import { useContinuousPurchase } from '../hooks/use-continuous-purchase';
import { useOpeningQueue } from '../hooks/use-opening-queue';

const mocks = vi.hoisted(() => ({
  nav: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
  record: vi.fn(),
  setBasePrice: vi.fn(),
  continuous: null as ContinuousDraft | null,
  queues: new Map<string, OpeningQueue>(),
}));
vi.mock('@dukani/platform', () => ({
  useActiveStore: () => ({ id: 'store' }),
  useNavigation: () => mocks.nav,
}));
vi.mock('../../../module', () => ({
  usePurchasingModule: () => ({
    receipts: { record: mocks.record },
    salePrices: { setBasePrice: mocks.setBasePrice },
    receiptDrafts: {
      continuous: async () => mocks.continuous,
      saveContinuous: async (_: string, d: ContinuousDraft) => void (mocks.continuous = d),
      queue: async (_: string, id: string) => mocks.queues.get(id) ?? null,
      saveQueue: async (_: string, q: OpeningQueue) => void mocks.queues.set(q.id, q),
    },
  }),
}));

const wrapper = () => {
  const client = createDataClient();
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <I18nProvider locale="fa" messages={{}}>
        <DataProvider client={client}>{children}</DataProvider>
      </I18nProvider>
    );
  };
};
const values = (patch: Partial<ReceiptFormOutput> = {}): ReceiptFormOutput => ({
  unitId: 'u',
  quantity: decimal.of(3),
  costStatus: 'Known',
  unitCost: money(1_000),
  zeroCostReason: null,
  productionDate: null,
  expiryDate: null,
  documentDate: '2026-10-19',
  supplierId: 's',
  invoiceNo: 'INV-1',
  discount: null,
  shipping: money(100),
  sideCharge: null,
  salePrice: null,
  ...patch,
});
const recorded = (receipt: QuickReceipt, number: number): RecordedReceipt => ({
  id: 'r' + number,
  number,
  kind: receipt.kind,
  documentDate: receipt.documentDate,
  supplierName: null,
  title: receipt.line.productId,
  unitName: 'u',
  quantity: receipt.line.quantity,
  qtyBase: receipt.line.quantity,
  costStatus: receipt.line.costStatus,
  totalAmount: money(0),
});
const lost = () => appError('Unknown', 'NETWORK', 'no answer');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.continuous = null;
  mocks.queues.clear();
  let n = 0;
  mocks.record.mockImplementation(async (_: string, receipt: QuickReceipt) => recorded(receipt, ++n));
});

describe('continuous purchase (CPB-06)', () => {
  it('records each purchase as its own receipt and readies the same form, the previous one viewable', async () => {
    const { result } = renderHook(() => useContinuousPurchase(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    await act(() => result.current.identify('pen', null));
    await act(() => result.current.submit('pen', 'pen', values()));
    expect(mocks.record).toHaveBeenCalledTimes(1);
    const [, first, firstOp] = mocks.record.mock.calls[0]!;
    expect(first).toMatchObject({ kind: 'Purchase', supplierId: 's', invoiceNo: 'INV-1' });
    await waitFor(() => expect(result.current.draft?.last?.number).toBe(1));
    expect(result.current.draft).toMatchObject({ productId: null, pending: null });
    expect(result.current.draft?.form.supplierId).toBe('');
    await act(() => result.current.identify('pen', null));
    await act(() => result.current.submit('pen', 'pen', values({ supplierId: null, invoiceNo: null })));
    const [, second, secondOp] = mocks.record.mock.calls[1]!;
    expect(secondOp).not.toBe(firstOp);
    expect(second).toMatchObject({ supplierId: null, invoiceNo: null });
  });

  it('an unknown answer keeps the purchase frozen; «بررسی دوباره» sends the same operation, never a second receipt', async () => {
    mocks.record.mockRejectedValueOnce(lost()).mockRejectedValueOnce(lost());
    const { result } = renderHook(() => useContinuousPurchase(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    await act(() => result.current.identify('pen', null));
    await act(() => result.current.submit('pen', 'pen', values()));
    expect(result.current.command.unknown).toBe(true);
    expect(result.current.draft?.pending).not.toBeNull();
    const op = mocks.record.mock.calls[0]![2];
    expect(mocks.record.mock.calls[1]![2]).toBe(op);
    await act(() => result.current.command.recover());
    expect(mocks.record.mock.calls[2]![2]).toBe(op);
    await waitFor(() => expect(result.current.draft?.pending).toBeNull());
    expect(result.current.draft?.last).not.toBeNull();
  }, 10_000);

  it('a refusal releases the frozen purchase and keeps the input; the owner reason is a new request', async () => {
    mocks.record.mockRejectedValueOnce(appError('BusinessRule', 'PURCHASE_DUPLICATE_INVOICE', 'duplicate'));
    const { result } = renderHook(() => useContinuousPurchase(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    await act(() => result.current.identify('pen', null));
    await act(() => result.current.submit('pen', 'pen', values()));
    await waitFor(() => expect(result.current.draft?.pending).toBeNull());
    expect(result.current.command.failed?.code).toBe('PURCHASE_DUPLICATE_INVOICE');
    expect(result.current.draft?.productId).toBe('pen');
    await act(() => result.current.confirmDuplicate('pen', 'pen', 'فاکتور اصلاحی'));
    const [, retried, retriedOp] = mocks.record.mock.calls[1]!;
    expect(retried.duplicateInvoiceReason).toBe('فاکتور اصلاحی');
    expect(retriedOp).not.toBe(mocks.record.mock.calls[0]![2]);
  });

  it('the sale price is its own command after the receipt; its failure leaves the receipt recorded', async () => {
    mocks.setBasePrice.mockRejectedValueOnce(appError('Permission', 'PERMISSION_DENIED', 'no'));
    const { result } = renderHook(() => useContinuousPurchase(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.draft).not.toBeNull());
    await act(() => result.current.identify('pen', null));
    await act(() => result.current.submit('pen', 'pen', values({ salePrice: money(15_000) })));
    await waitFor(() => expect(result.current.price.state?.status).toBe('failed'));
    expect(mocks.setBasePrice).toHaveBeenCalledWith('store', 'pen', money(15_000), expect.any(String));
    expect(result.current.draft?.last?.number).toBe(1);
    expect(mocks.record).toHaveBeenCalledTimes(1);
  });
});

describe('opening queue (CPB-04)', () => {
  const start = () => {
    const queue = createOpeningQueue(
      'q',
      ['pen', 'notebook', 'pencil'].map((id) => ({ productId: id, title: id })),
    );
    mocks.queues.set('q', queue);
    return renderHook(() => useOpeningQueue('q'), { wrapper: wrapper() });
  };
  const opening = values({
    documentDate: null,
    supplierId: null,
    invoiceNo: null,
    shipping: null,
    costStatus: 'Unknown',
    unitCost: null,
  });

  it('a failure on item 3 leaves 1–2 recorded; its retry reuses its own operation', async () => {
    const { result } = start();
    await waitFor(() => expect(result.current.queue).not.toBeNull());
    await act(() => result.current.submit('pen', 'pen', opening));
    await act(() => result.current.submit('notebook', 'notebook', opening));
    mocks.record.mockRejectedValueOnce(lost()).mockRejectedValueOnce(lost());
    await act(() => result.current.submit('pencil', 'pencil', opening));
    expect(result.current.command.unknown).toBe(true);
    expect(result.current.queue?.items.map((i) => i.status)).toEqual(['recorded', 'recorded', 'pending']);
    const ops = mocks.record.mock.calls.map((c) => c[2]);
    expect(new Set(ops.slice(0, 3)).size).toBe(3);
    await act(() => result.current.command.recover());
    expect(mocks.record.mock.calls.at(-1)![2]).toBe(ops[2]);
    await waitFor(() =>
      expect(result.current.queue?.items.map((i) => i.status)).toEqual(['recorded', 'recorded', 'recorded']),
    );
    expect(mocks.record.mock.calls.map((c) => c[1].kind)).toEqual([
      'Opening',
      'Opening',
      'Opening',
      'Opening',
      'Opening',
    ]);
    expect(mocks.record.mock.calls[0]![1]).toMatchObject({
      supplierId: null,
      documentDate: null,
      charges: { shipping: null },
    });
  }, 10_000);

  it('a skip sends nothing; a product with history meanwhile is marked blocked and the queue moves on', async () => {
    mocks.record.mockRejectedValueOnce(appError('BusinessRule', 'OPENING_NOT_ALLOWED', 'history'));
    const { result } = start();
    await waitFor(() => expect(result.current.queue).not.toBeNull());
    await act(() => result.current.skip('pen'));
    await waitFor(() => expect(result.current.queue?.currentId).toBe('notebook'));
    expect(mocks.record).not.toHaveBeenCalled();
    await act(() => result.current.submit('notebook', 'notebook', opening));
    await waitFor(() =>
      expect(result.current.queue?.items.map((i) => i.status)).toEqual(['skipped', 'blocked', 'pending']),
    );
    expect(result.current.blocked).toBe('notebook');
    expect(result.current.queue?.currentId).toBe('pencil');
    await act(() => result.current.end());
    await waitFor(() => expect(result.current.queue?.ended).toBe(true));
    expect(result.current.queue?.items.map((i) => i.status)).toEqual(['skipped', 'blocked', 'pending']);
  });
});
