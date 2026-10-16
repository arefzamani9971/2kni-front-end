'use client';
import { memo } from 'react';
import { appError } from '@dukani/domain';
import { useCan } from '@dukani/platform';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import { AttachmentStockAction } from './AttachmentStockAction';
import type { AttachmentSummaryRow } from './AttachmentOutcome.types';

export const AttachmentOutcome = memo(function AttachmentOutcome({ entry }: { entry: AttachmentSummaryRow }) {
  const t = useAttachmentTranslations();
  const message = useAppErrorMessage();
  const canStock = useCan('purchase.manage');
  const { row, selection, result } = entry;
  const code = result?.errorCode ?? row.errorCode;
  const status = result ? t(`status.${result.status}`) : t(row.storeProductId ? 'member' : 'available');
  return (
    <div className="flex flex-col gap-2">
      <p>{code ? message(appError('BusinessRule', code, '')) : status}</p>
      {canStock && selection && result?.status === 'Added' && result.storeProductId ? (
        <AttachmentStockAction
          catalogItemId={selection.row.catalogItemId}
          storeProductId={result.storeProductId}
        />
      ) : null}
    </div>
  );
});
