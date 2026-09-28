'use client';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, Chip, ChipGroup, NavCard, PageState } from '@dukani/ui-kit';
import { useState } from 'react';
import { LIST_FILTERS, summaryCard, type ListFilter } from '../../domain/purchase';
import { PurchasingShell } from '../components/PurchasingShell';
import { usePurchaseList } from '../hooks/use-purchase-list';

/** purchaselist (Figma 358:546): receipts with status chips; drafts continue where they stopped (F71). */
export function PurchasesScreen({ initialFilter = 'All' }: { initialFilter?: ListFilter }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const canBuy = useCan('purchase.manage');
  const [filter, setFilter] = useState<ListFilter>(initialFilter);
  // «اصلاح‌شده» needs the corrections filter of BCR/backlog; until then it shows finalized receipts
  const status = filter === 'Draft' ? 'Draft' : filter === 'All' ? undefined : 'Finalized';
  const list = usePurchaseList({ status });
  return (
    <PurchasingShell
      title="خریدها"
      back={() => nav.push(sellerRoutes.store.more(store.id))}
      actions={
        canBuy ? (
          <Button block onClick={() => nav.push(sellerRoutes.purchases.new(store.id))}>
            ثبت خرید
          </Button>
        ) : undefined
      }
    >
      <ChipGroup label="وضعیت رسید">
        {LIST_FILTERS.map((f) => (
          <Chip key={f.value} selected={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </ChipGroup>
      {list.isPending ? <PageState kind="loading" rows={3} /> : null}
      {list.error ? <PageState kind="error" description={list.error.message} /> : null}
      {list.isSuccess && list.items.length === 0 ? (
        <PageState kind="empty" title="رسیدی نیست" description="خریدهای تأمین‌کننده و موجودی اول دوره اینجا می‌آیند." />
      ) : null}
      {list.items.map((p) => {
        const card = summaryCard(p);
        return (
          <NavCard
            key={p.id}
            href={p.status === 'Draft' ? sellerRoutes.purchases.lines(store.id, p.id) : sellerRoutes.purchases.detail(store.id, p.id)}
            title={card.title}
            meta={card.meta}
            cta={card.cta}
          />
        );
      })}
      {list.hasNextPage ? (
        <Button variant="secondary" block loading={list.isFetchingNextPage} onClick={list.fetchNextPage}>
          رسیدهای بیشتر
        </Button>
      ) : null}
    </PurchasingShell>
  );
}
