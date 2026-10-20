'use client';
import { useInvalidate } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useState } from 'react';
import { usePurchasingModule } from '../../module';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import type { SalePricePlan, SalePriceState } from './use-sale-price-follow-up.types';

/**
 * The optional sale price after a confirmed receipt (BIZ-PUR-08): its own command, reported on its own. A failure
 * keeps the receipt recorded and offers a retry of the price only — never a second receipt.
 */
export function useSalePriceFollowUp() {
  const { salePrices } = usePurchasingModule();
  const store = useActiveStore();
  const t = usePurchaseTranslations();
  const invalidate = useInvalidate();
  const [state, setState] = useState<SalePriceState | null>(null);
  const run = async (plan: SalePricePlan) => {
    setState({ ...plan, status: 'running' });
    try {
      await salePrices.setBasePrice(store.id, plan.productId, plan.amount, t('receipt.priceReason'));
      setState({ ...plan, status: 'done' });
      await invalidate(['products', store.id]).catch(() => undefined);
    } catch {
      setState({ ...plan, status: 'failed' });
    }
  };
  return {
    state,
    run,
    retry: () => (state ? run(state) : Promise.resolve()),
    dismiss: () => setState(null),
  };
}
