'use client';
import { Alert, Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { isStockUnitRefusal } from '../../domain/stock-unit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { ReviewStatusProps } from './ReviewStatus.types';
import { UnitReselectAlert } from './UnitReselectAlert';

/**
 * Where the review stands, above its summary: an unknown register with «بررسی دوباره», a start that failed, a stock
 * unit to choose again (stale, or refused by the server), a refusal, a saved product whose follow-up failed, and the
 * preview's own error or wait. A refused unit replaces the generic failure messages.
 */
export function ReviewStatus({
  draft,
  save,
  preview: { preview, unitStale },
  register,
  startError,
}: ReviewStatusProps) {
  const t = useEntryTranslations();
  const errorMessage = useAppErrorMessage();
  const unitRefused = isStockUnitRefusal(preview.error) || isStockUnitRefusal(register.failed);
  return (
    <>
      {register.unknown ? (
        <PageState
          kind="unknown-result"
          action={
            <Button variant="secondary" onClick={() => void register.recover()}>
              {t('checkAgain')}
            </Button>
          }
        />
      ) : null}
      {startError ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {unitStale || unitRefused ? <UnitReselectAlert draft={draft} save={save} /> : null}
      {register.failed && !unitRefused ? (
        <Alert title={t('submitFailed')} description={errorMessage(register.failed)} />
      ) : null}
      {register.completionErrors.length ? (
        <Alert tone="warning" title={t('productSaved')} description={t('resultIncomplete')} />
      ) : null}
      {preview.error && !unitRefused ? (
        <Alert title={t('incomplete')} description={errorMessage(preview.error)} />
      ) : null}
      {preview.isPending && !unitStale ? <PageState kind="loading" rows={3} /> : null}
    </>
  );
}
