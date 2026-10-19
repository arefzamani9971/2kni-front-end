'use client';
import { Alert, Button, ReviewScene } from '@dukani/ui-kit';
import type { BulkResult } from '../../../domain/bulk-draft.types';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

/** Committed bulk entry: how many items and whether a receipt was created. */
export function BulkSuccessDialog({
  result,
  onStartOver,
  onInventory,
}: {
  result: BulkResult;
  onStartOver: () => void;
  onInventory: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <ReviewScene
      open
      title={t('bulk.done')}
      onOpenChange={() => {}}
      actions={
        <>
          <Button onClick={onStartOver}>{t('bulk.new')}</Button>
          <Button variant="secondary" onClick={onInventory}>
            {t('bulk.inventory')}
          </Button>
        </>
      }
    >
      <Alert
        tone="success"
        title={t('bulk.success', { count: result.results.length })}
        description={result.purchaseId ? t('bulk.receiptCreated') : t('bulk.productsCreated')}
      />
    </ReviewScene>
  );
}
