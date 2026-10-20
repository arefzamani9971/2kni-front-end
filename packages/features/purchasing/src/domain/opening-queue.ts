import type {
  OpeningItemStatus,
  OpeningProgress,
  OpeningQueue,
  OpeningQueueItem,
} from './opening-queue.types';

export const createOpeningQueue = (
  id: string,
  products: readonly { readonly productId: string; readonly title: string }[],
): OpeningQueue => ({
  schemaVersion: 1,
  id,
  items: products.map((p) => ({ ...p, status: 'pending', receipt: null })),
  currentId: products[0]?.productId ?? null,
  form: null,
  pending: null,
  ended: false,
});

export const currentItem = (queue: OpeningQueue): OpeningQueueItem | null =>
  queue.ended
    ? null
    : (queue.items.find((i) => i.productId === queue.currentId && i.status === 'pending') ?? null);

/** The next item still to enter: after the given one in queue order, then from the start. */
const nextPending = (items: readonly OpeningQueueItem[], afterId: string): string | null => {
  const at = items.findIndex((i) => i.productId === afterId);
  const ordered = [...items.slice(at + 1), ...items.slice(0, at + 1)];
  return ordered.find((i) => i.status === 'pending')?.productId ?? null;
};

/**
 * Settles one item — recorded with its receipt, skipped without any effect, or blocked by the server — and moves to
 * the next one. Its form and frozen request go with it; the other items are untouched.
 */
export const settleItem = (
  queue: OpeningQueue,
  productId: string,
  status: Exclude<OpeningItemStatus, 'pending'>,
  receipt: OpeningQueueItem['receipt'] = null,
): OpeningQueue => {
  const items = queue.items.map((i) => (i.productId === productId ? { ...i, status, receipt } : i));
  return {
    ...queue,
    items,
    currentId: queue.currentId === productId ? nextPending(items, productId) : queue.currentId,
    form: queue.form?.productId === productId ? null : queue.form,
    pending: queue.pending?.productId === productId ? null : queue.pending,
  };
};

/** «پایان»: what is recorded stays recorded; the rest is simply not entered. Refused while an answer is unknown. */
export const endQueue = (queue: OpeningQueue): OpeningQueue =>
  queue.pending ? queue : { ...queue, ended: true, currentId: null, form: null };

export const openingProgress = (queue: OpeningQueue): OpeningProgress => {
  const count = (status: OpeningItemStatus) => queue.items.filter((i) => i.status === status).length;
  return {
    total: queue.items.length,
    recorded: count('recorded'),
    skipped: count('skipped'),
    blocked: count('blocked'),
    remaining: count('pending'),
  };
};

/** The queue shows its result once ended or when no item is left to enter. */
export const isQueueDone = (queue: OpeningQueue) => queue.ended || queue.currentId === null;
