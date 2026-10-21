'use client';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, ButtonLink, RecordList } from '@dukani/ui-kit';
import type { OpeningQueue, OpeningQueueItem } from '../../../domain/opening-queue.types';
import { usePurchasePresentation } from '../../common/hooks/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';

/**
 * «خلاصهٔ موجودی اولیه» (1255:64 / 1255:144): what each item ended as. Recorded items keep their receipts; a
 * recorded or blocked item is corrected on its own (product page), never by entering the Opening again.
 */
export function OpeningResult({ queue }: { queue: OpeningQueue }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const store = useActiveStore();
  const info = (item: OpeningQueueItem) =>
    item.status === 'recorded'
      ? t('opening.resultRecorded', {
          number: item.receipt?.number == null ? '—' : presentation.qty(item.receipt.number),
        })
      : item.status === 'skipped'
        ? t('opening.resultSkipped')
        : item.status === 'blocked'
          ? t('opening.resultBlocked')
          : t('opening.resultPending');
  const edit = (item: OpeningQueueItem) =>
    item.status === 'recorded' || item.status === 'blocked' ? (
      <ButtonLink size="sm" variant="secondary" href={sellerRoutes.products.detail(store.id, item.productId)}>
        {t('opening.singleEdit')}
      </ButtonLink>
    ) : null;
  return (
    <>
      <Alert tone="info" title={t('opening.resultInfo')} />
      <RecordList
        label={t('opening.resultTitle')}
        columns={[t('opening.resultColumnTitle'), t('opening.resultColumnInfo'), '']}
        rows={queue.items.map((item) => ({
          id: item.productId,
          cells: [item.title, info(item), edit(item)],
          card: (
            <section className="bg-surface border-line flex flex-col gap-2 rounded-md border p-4">
              <h2 className="text-label-m">{item.title}</h2>
              <p className="text-body-s text-fg-secondary">{info(item)}</p>
              {edit(item)}
            </section>
          ),
        }))}
      />
    </>
  );
}
