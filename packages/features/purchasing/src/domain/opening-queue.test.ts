import { decimal } from '@dukani/domain';
import {
  createOpeningQueue,
  currentItem,
  endQueue,
  isQueueDone,
  openingProgress,
  settleItem,
} from './opening-queue';
import type { OpeningQueue } from './opening-queue.types';
import { emptyReceiptForm } from './receipt-form';

const products = ['pen', 'notebook', 'pencil'].map((id) => ({ productId: id, title: id }));
const pending = (productId: string): OpeningQueue['pending'] => ({
  productId,
  operationId: 'op-' + productId,
  receipt: {
    kind: 'Opening',
    line: {
      productId,
      unitId: 'u',
      quantity: decimal.of(1),
      costStatus: 'Unknown',
      unitCost: null,
      zeroCostReason: null,
      productionDate: null,
      expiryDate: null,
    },
    supplierId: null,
    invoiceNo: null,
    documentDate: null,
    duplicateInvoiceReason: null,
    charges: { discount: null, shipping: null, sideCharge: null },
  },
});

describe('opening queue (CPB-04): independent items, never one transaction', () => {
  it('records an item, keeps its receipt and moves to the next', () => {
    const q = settleItem(createOpeningQueue('q', products), 'pen', 'recorded', { id: 'r1', number: 101 });
    expect(q.items[0]).toMatchObject({ status: 'recorded', receipt: { id: 'r1', number: 101 } });
    expect(currentItem(q)?.productId).toBe('notebook');
  });

  it('a skip has no effect on any other item and clears only its own form', () => {
    const start = {
      ...createOpeningQueue('q', products),
      form: { productId: 'pen', values: emptyReceiptForm('') },
    };
    const q = settleItem(start, 'pen', 'skipped');
    expect(q.items.map((i) => i.status)).toEqual(['skipped', 'pending', 'pending']);
    expect(q.form).toBeNull();
  });

  it('a failure on item 3 leaves items 1–2 recorded; a blocked item is kept as such', () => {
    let q = createOpeningQueue('q', products);
    q = settleItem(q, 'pen', 'recorded', { id: 'r1', number: 1 });
    q = settleItem(q, 'notebook', 'recorded', { id: 'r2', number: 2 });
    q = settleItem({ ...q, pending: pending('pencil') }, 'pencil', 'blocked');
    expect(q.items.map((i) => i.status)).toEqual(['recorded', 'recorded', 'blocked']);
    expect(q.pending).toBeNull();
    expect(isQueueDone(q)).toBe(true);
    expect(openingProgress(q)).toEqual({ total: 3, recorded: 2, skipped: 0, blocked: 1, remaining: 0 });
  });

  it('the next item wraps to one still waiting before the settled one', () => {
    let q = createOpeningQueue('q', products);
    q = { ...q, currentId: 'notebook' };
    q = settleItem(q, 'notebook', 'skipped');
    expect(q.currentId).toBe('pencil');
    q = settleItem(q, 'pencil', 'skipped');
    expect(q.currentId).toBe('pen');
  });

  it('ending keeps what is recorded and is refused while an answer is unknown', () => {
    const frozen = { ...createOpeningQueue('q', products), pending: pending('pen') };
    expect(endQueue(frozen)).toBe(frozen);
    const ended = endQueue(
      settleItem(createOpeningQueue('q', products), 'pen', 'recorded', { id: 'r', number: 1 }),
    );
    expect(ended.ended).toBe(true);
    expect(isQueueDone(ended)).toBe(true);
    expect(currentItem(ended)).toBeNull();
    expect(ended.items[0]?.status).toBe('recorded');
  });
});
