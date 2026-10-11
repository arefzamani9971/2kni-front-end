'use client';
import type { AppError } from '@dukani/domain';
import { Alert, useAppErrorMessage } from '@dukani/ui-kit';
import { useStoreTranslations } from '../i18n/use-store-translations';

/** One banner above the edit pages: version conflict, logo upload failure, or a non-field save error. */
export function StoreEditBanner({
  conflict,
  logoError,
  saveError,
}: {
  conflict: boolean;
  logoError: AppError | null;
  saveError: AppError | null;
}) {
  const t = useStoreTranslations();
  const errorMessage = useAppErrorMessage();
  if (conflict) return <Alert tone="warning" title={t('conflict')} description={t('profileConflict')} />;
  if (logoError) return <Alert title={t('uploadFailed')} description={errorMessage(logoError)} />;
  if (saveError && saveError.kind !== 'Validation')
    return <Alert title={t('notSaved')} description={errorMessage(saveError)} />;
  return null;
}
