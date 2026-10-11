'use client';
import { isAppError, type AppError } from '@dukani/domain';
import { Alert, Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Offline, local failures, a definitive commit failure, or an unknown commit result with explicit recovery. */
export function BulkStatusAlerts({
  online,
  failure,
  commitError,
  unknown,
  onRecover,
}: {
  online: boolean;
  failure: unknown;
  commitError: AppError | null;
  unknown: boolean;
  onRecover: () => void;
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  return (
    <>
      {!online ? <Alert tone="warning" title={t('bulk.offline')} /> : null}
      {failure ? (
        <Alert tone="danger" title={isAppError(failure) ? message(failure) : t('startFailed')} />
      ) : null}
      {commitError ? <Alert tone="danger" title={message(commitError)} /> : null}
      {unknown ? (
        <PageState kind="unknown-result" action={<Button onClick={onRecover}>{t('checkAgain')}</Button>} />
      ) : null}
    </>
  );
}
