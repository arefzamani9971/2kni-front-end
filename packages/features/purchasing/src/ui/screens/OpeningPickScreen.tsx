'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, SearchField } from '@dukani/ui-kit';
import { OpeningPickGrid } from '../components/OpeningPickGrid';
import { PurchasingShell } from '../common/components/PurchasingShell';
import { useOpeningPick } from '../hooks/use-opening-pick';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

/**
 * Grouped opening stock — pick (CPB-04 / US-F13-01, Figma 1255:61 · 1255:141): choose several goods without stock
 * history, then «شروع ثبت» enters them one by one, each as its own Opening.
 */
export function OpeningPickScreen() {
  const t = usePurchaseTranslations();
  const store = useActiveStore();
  const nav = useNavigation();
  const pick = useOpeningPick();
  return (
    <PurchasingShell
      title={t('opening.pickTitle')}
      back={() => nav.push(sellerRoutes.purchases.list(store.id))}
      actions={
        <>
          <Button block loading={pick.starting} disabled={pick.count === 0} onClick={() => void pick.start()}>
            {t('opening.start', { count: pick.count })}
          </Button>
          <Button variant="secondary" block onClick={() => nav.push(sellerRoutes.purchases.list(store.id))}>
            {t('back')}
          </Button>
        </>
      }
    >
      {pick.failed ? <Alert tone="danger" title={t('receipt.draftFailed')} /> : null}
      <SearchField
        label={t('opening.searchLabel')}
        placeholder={t('opening.searchPlaceholder')}
        value={pick.text}
        onChange={pick.setText}
      />
      <OpeningPickGrid source={pick.list} selection={pick.selection} />
      <p className="text-body-s text-fg-secondary">{t('opening.pickHint', { count: pick.count })}</p>
    </PurchasingShell>
  );
}
