'use client';
import { cn } from '@dukani/ui-kit';
import { openingProgress } from '../../domain/opening-queue';
import type { OpeningQueue, OpeningQueueItem } from '../../domain/opening-queue.types';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

/**
 * «کالاهای انتخاب‌شده» (1255:62): every item of the queue with its state — in progress, waiting, recorded with
 * its receipt, skipped or not allowed — and the progress counts. Ending never undoes a recorded item.
 */
export function OpeningQueuePanel({ queue }: { queue: OpeningQueue }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const progress = openingProgress(queue);
  const state = (item: OpeningQueueItem) =>
    item.status === 'recorded'
      ? t('opening.itemRecorded', {
          number: item.receipt?.number == null ? '—' : presentation.qty(item.receipt.number),
        })
      : item.status === 'skipped'
        ? t('opening.itemSkipped')
        : item.status === 'blocked'
          ? t('opening.itemBlocked')
          : item.productId === queue.currentId
            ? t('opening.itemCurrent')
            : t('opening.itemPending');
  return (
    <section
      className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4"
      aria-label={t('opening.selected')}
    >
      <h2 className="text-label-l text-fg-primary">{t('opening.selected')}</h2>
      <p className="text-body-s text-fg-secondary" aria-live="polite">
        {t('opening.progress', progress)}
      </p>
      <ol className="flex flex-col gap-1">
        {queue.items.map((item) => (
          <li
            key={item.productId}
            aria-current={item.productId === queue.currentId ? 'step' : undefined}
            className={cn(
              'flex flex-col gap-1 rounded-sm p-3',
              item.productId === queue.currentId && 'bg-brand-subtle',
            )}
          >
            <span className="text-label-m text-fg-primary">{item.title}</span>
            <span className="text-body-s text-fg-secondary">{state(item)}</span>
          </li>
        ))}
      </ol>
      <p className="text-body-s text-fg-tertiary">{t('opening.endNote')}</p>
    </section>
  );
}
