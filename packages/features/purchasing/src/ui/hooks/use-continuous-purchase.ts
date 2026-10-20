'use client';
import { todayDateOnly } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useRef } from 'react';
import { afterRecorded, identifyProduct, newContinuousDraft } from '../../domain/continuous-purchase';
import type { ContinuousDraft } from '../../domain/continuous-purchase.types';
import { toQuickReceipt } from '../../domain/receipt-form';
import type { ReceiptFormOutput, ReceiptFormValues } from '../../domain/receipt-form.types';
import type { PendingReceipt } from '../../domain/receipt.types';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from '../common/state/purchase-keys';
import { useLocalDraft } from '../quick-receipt/hooks/use-local-draft';
import { useReceiptCommand } from '../quick-receipt/hooks/use-receipt-command';
import { useSalePriceFollowUp } from '../quick-receipt/hooks/use-sale-price-follow-up';
import type { SalePricePlan } from '../quick-receipt/types/use-sale-price-follow-up.types';

const freeze = (d: ContinuousDraft, pending: PendingReceipt): ContinuousDraft => ({ ...d, pending });
const release = (d: ContinuousDraft): ContinuousDraft => ({ ...d, pending: null });

/**
 * The continuous single-product purchase (CPB-06): one local draft per user and store, one idempotent receipt per
 * «ثبت خرید». After a confirmed receipt the same form is ready again (nothing carried over) and the receipt stays
 * viewable; an unknown answer keeps the turn frozen; clearing the current turn never touches recorded receipts.
 */
export function useContinuousPurchase() {
  const { receiptDrafts } = usePurchasingModule();
  const store = useActiveStore();
  const nav = useNavigation();
  const local = useLocalDraft<ContinuousDraft>({
    queryKey: purchaseKeys(store.id).custom('continuous-draft'),
    load: () => receiptDrafts.continuous(store.id),
    write: (draft) => receiptDrafts.saveContinuous(store.id, draft),
    initial: () => newContinuousDraft(todayDateOnly()),
  });
  const price = useSalePriceFollowUp();
  const plan = useRef<SalePricePlan | null>(null);
  const last = useRef<ReceiptFormOutput | null>(null);
  const command = useReceiptCommand(local.draft, local.save, {
    freeze,
    release,
    onRecorded: async (recorded) => {
      const saved = await local.save(() => afterRecorded(recorded, todayDateOnly()));
      if (!saved) throw new Error('DRAFT_SAVE_FAILED');
      // a preselected product belongs to the first turn only
      nav.replace(sellerRoutes.purchases.continuous(store.id));
      const next = plan.current;
      plan.current = null;
      if (next) await price.run(next);
    },
  });
  const submit = (
    productId: string,
    title: string,
    values: ReceiptFormOutput,
    duplicateReason: string | null = null,
  ) => {
    last.current = values;
    plan.current = values.salePrice ? { productId, title, amount: values.salePrice } : null;
    price.dismiss();
    return command.submit(toQuickReceipt('Purchase', productId, values, duplicateReason));
  };
  return {
    draft: local.draft,
    loading: local.loading,
    error: local.error,
    command,
    price,
    identify: (productId: string, unitId: string | null) =>
      local.save((d) => identifyProduct(d, productId, unitId)),
    /** The form's autosave; ignored once the turn moved to another product or was frozen. */
    saveForm: (productId: string, values: ReceiptFormValues) =>
      local.save((d) => (d.productId === productId && !d.pending ? { ...d, form: values } : d)),
    clear: () =>
      local.save((d) => (d.pending ? d : { ...newContinuousDraft(todayDateOnly()), last: d.last })),
    submit,
    /** Re-sends the refused turn with the owner's duplicate-invoice reason (a new operation, a new body). */
    confirmDuplicate: (productId: string, title: string, reason: string) =>
      last.current ? submit(productId, title, last.current, reason) : Promise.resolve(),
  };
}
