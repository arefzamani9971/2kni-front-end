'use client';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { PageState } from '@dukani/ui-kit';
import { useEffect } from 'react';

import { PurchasingShell } from '../components/PurchasingShell';

import { usePurchase } from '../hooks/use-purchase';
import { Totals } from '../components/Totals';

/** purchasetotals (Figma 358:547): discount, extra costs, supplier invoice check → «ثبت نهایی خرید» (F71). */
export function PurchaseTotalsScreen({ purchaseId }: { purchaseId: string }) {
  const t = usePurchaseTranslations();

  const purchase = usePurchase(purchaseId);
  const nav = useNavigation();
  const store = useActiveStore();
  const p = purchase.data;
  const finalized = p && p.status !== 'Draft';
  useEffect(() => {
    if (finalized) nav.replace(sellerRoutes.purchases.detail(store.id, purchaseId));
  }, [finalized, nav, store.id, purchaseId]);
  if (!p || finalized)
    return (
      <PurchasingShell title={t('purchaseTotals')} back={() => nav.back()}>
        {purchase.error ? (
          <PageState kind="error" description={purchase.error.message} />
        ) : (
          <PageState kind="loading" rows={3} />
        )}
      </PurchasingShell>
    );
  return <Totals key={p.id} purchase={p} />;
}
