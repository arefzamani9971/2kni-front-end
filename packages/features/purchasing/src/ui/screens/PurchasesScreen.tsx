'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, Chip, ChipGroup, NavCard, PageState } from '@dukani/ui-kit';
import { useState } from 'react';
import type { ListFilter } from '../../domain/purchase.types';
import { PurchasingShell } from '../components/PurchasingShell';
import { usePurchaseList } from '../hooks/use-purchase-list';

/** purchaselist (Figma 358:546): receipts with status chips; drafts continue where they stopped (F71). */
export function PurchasesScreen({ initialFilter = 'All' }: { initialFilter?: ListFilter }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const canBuy = useCan('purchase.manage');
  const [filter, setFilter] = useState<ListFilter>(initialFilter);
  // «اصلاح‌شده» needs the corrections filter of BCR/backlog; until then it shows finalized receipts
  const status = filter === 'Draft' ? 'Draft' : filter === 'All' ? undefined : 'Finalized';
  const list = usePurchaseList({ status });
  return (
    <PurchasingShell
      title={t('purchases')}
      back={() => nav.push(sellerRoutes.store.more(store.id))}
      actions={
        canBuy ? (
          <>
            <Button block onClick={() => nav.push(sellerRoutes.purchases.new(store.id))}>
              {t('recordPurchase')}
            </Button>
            <Button
              variant="secondary"
              block
              onClick={() => nav.push(sellerRoutes.purchases.continuous(store.id))}
            >
              {t('continuous.entry')}
            </Button>
            <Button
              variant="secondary"
              block
              onClick={() => nav.push(sellerRoutes.purchases.opening(store.id))}
            >
              {t('opening.entry')}
            </Button>
          </>
        ) : undefined
      }
    >
      <ChipGroup label={t('receiptStatus')}>
        {presentation.listFilters.map((f) => (
          <Chip key={f.value} selected={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </ChipGroup>
      {list.isPending ? <PageState kind="loading" rows={3} /> : null}
      {list.error ? <PageState kind="error" description={errorMessage(list.error)} /> : null}
      {list.isSuccess && list.items.length === 0 ? (
        <PageState kind="empty" title={t('empty')} description={t('emptyHint')} />
      ) : null}
      {list.items.map((p) => {
        const card = presentation.summaryCard(p);
        return (
          <NavCard
            key={p.id}
            href={
              p.status === 'Draft'
                ? sellerRoutes.purchases.lines(store.id, p.id)
                : sellerRoutes.purchases.detail(store.id, p.id)
            }
            title={card.title}
            meta={card.meta}
            cta={card.cta}
          />
        );
      })}
      {list.hasNextPage ? (
        <Button variant="secondary" block loading={list.isFetchingNextPage} onClick={list.fetchNextPage}>
          {t('moreReceipts')}
        </Button>
      ) : null}
    </PurchasingShell>
  );
}
