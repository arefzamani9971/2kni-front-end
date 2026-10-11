'use client';
import type { AppError } from '@dukani/domain';
import { Alert, Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { DuplicateChoice } from './DuplicateChoice';

/**
 * What a catalog create command left behind: an unknown result to recover with the same request, an existing
 * record to reuse after a duplicate conflict, or a plain error.
 */
export function CommandOutcome({
  unknown,
  onRetry,
  duplicateName,
  onUseDuplicate,
  error,
}: {
  unknown: boolean;
  onRetry: () => void;
  duplicateName: string | null;
  onUseDuplicate: () => void;
  error: AppError | null;
}) {
  const t = useCatalogTexts();
  const message = useAppErrorMessage();
  return (
    <>
      {unknown ? (
        <PageState kind="unknown-result" action={<Button onClick={onRetry}>{t('retry')}</Button>} />
      ) : null}
      {duplicateName !== null ? (
        <DuplicateChoice name={duplicateName} onUse={onUseDuplicate} />
      ) : error ? (
        <Alert tone="danger" title={message(error)} />
      ) : null}
    </>
  );
}
