'use client';
import type { ReactNode } from 'react';
import { Button, PageState, ReviewScene, useAppErrorMessage } from '@dukani/ui-kit';
import type { useBulkCommit } from '../hooks/use-bulk-commit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { BulkPreviewSummary } from './BulkPreviewSummary';

/** Server preview of the bulk rows (errors, warnings, receipt total) before the all-or-none commit. */
export function BulkReviewDialog({
  preview,
  actions,
  onClose,
  onRefreshRow,
}: {
  preview: ReturnType<typeof useBulkCommit>['preview'];
  actions: ReactNode;
  onClose?: () => void;
  onRefreshRow?: (clientRowId: string) => void;
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  return (
    <ReviewScene
      open
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
      title={t('bulk.review')}
      className="desktop:max-w-[640px]"
      actions={actions}
    >
      <div className="flex flex-col gap-4">
        {preview.data ? <BulkPreviewSummary data={preview.data} onRefreshRow={onRefreshRow} /> : null}
        {preview.isPending ? <PageState kind="loading" /> : null}
        {preview.error ? (
          <PageState
            kind="error"
            description={message(preview.error)}
            action={<Button onClick={() => void preview.refetch()}>{t('retry')}</Button>}
          />
        ) : null}
      </div>
    </ReviewScene>
  );
}
