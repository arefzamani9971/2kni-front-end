'use client';
import { useActiveStore } from '@dukani/platform';
import { useEffect, useRef, useState } from 'react';
import { endQueue, settleItem } from '../../domain/opening-queue';
import type { OpeningQueue } from '../../domain/opening-queue.types';
import { toQuickReceipt } from '../../domain/receipt-form';
import type { ReceiptFormOutput, ReceiptFormValues } from '../../domain/receipt-form.types';
import type { PendingReceipt } from '../../domain/receipt.types';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from '../common/state/purchase-keys';
import { useLocalDraft } from './use-local-draft';
import { useReceiptCommand } from './use-receipt-command';
import { useSalePriceFollowUp } from './use-sale-price-follow-up';
import type { SalePricePlan } from './use-sale-price-follow-up.types';

const freeze = (q: OpeningQueue, pending: PendingReceipt): OpeningQueue => ({
  ...q,
  pending: { ...pending, productId: pending.receipt.line.productId },
});
const release = (q: OpeningQueue): OpeningQueue => ({ ...q, pending: null });

/**
 * The opening queue (CPB-04): every item is its own idempotent Opening. A recorded item stays recorded whatever
 * happens to the next one; skip has no effect; a product the server finds with stock history meanwhile is marked
 * blocked and the queue moves on; while an answer is unknown nothing else moves until it is checked again.
 */
export function useOpeningQueue(queueId: string) {
  const { receiptDrafts } = usePurchasingModule();
  const store = useActiveStore();
  const local = useLocalDraft<OpeningQueue>({
    queryKey: purchaseKeys(store.id).custom('opening-queue', queueId),
    load: () => receiptDrafts.queue(store.id, queueId),
    write: (queue) => receiptDrafts.saveQueue(store.id, queue),
    initial: () => null,
  });
  const price = useSalePriceFollowUp();
  const plan = useRef<SalePricePlan | null>(null);
  const sent = useRef<{ productId: string; title: string } | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const command = useReceiptCommand(local.draft, local.save, {
    freeze,
    release,
    onRecorded: async (recorded, pending) => {
      const saved = await local.save((q) =>
        settleItem(q, pending.receipt.line.productId, 'recorded', {
          id: recorded.id,
          number: recorded.number,
        }),
      );
      if (!saved) throw new Error('DRAFT_SAVE_FAILED');
      const next = plan.current;
      plan.current = null;
      if (next) await price.run(next);
    },
  });
  const { failed, reset } = command;
  const { save } = local;
  useEffect(() => {
    const item = sent.current;
    if (failed?.code !== 'OPENING_NOT_ALLOWED' || !item) return;
    sent.current = null;
    setBlocked(item.title);
    void save((q) => settleItem(q, item.productId, 'blocked')).then(reset);
  }, [failed, save, reset]);
  return {
    queue: local.draft,
    loading: local.loading,
    error: local.error,
    command,
    price,
    blocked,
    saveForm: (productId: string, values: ReceiptFormValues) =>
      save((q) => (q.currentId === productId && !q.pending ? { ...q, form: { productId, values } } : q)),
    submit: (productId: string, title: string, values: ReceiptFormOutput) => {
      setBlocked(null);
      price.dismiss();
      sent.current = { productId, title };
      plan.current = values.salePrice ? { productId, title, amount: values.salePrice } : null;
      return command.submit(toQuickReceipt('Opening', productId, values));
    },
    skip: (productId: string) => {
      setBlocked(null);
      reset();
      return save((q) => (q.pending ? q : settleItem(q, productId, 'skipped')));
    },
    end: () => save(endQueue),
  };
}
