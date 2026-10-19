'use client';
import type { AppError } from '@dukani/domain';
import { Alert, Button, useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

/** Recoverable problems of the details step: the draft could not be saved, or the type schema did not load. */
export function DetailsStatusAlerts({
  draftFailed,
  onRetryDraft,
  schemaError,
  onRetrySchema,
}: {
  draftFailed: boolean;
  onRetryDraft: () => void;
  schemaError: AppError | null;
  onRetrySchema: () => void;
}) {
  const t = useEntryTranslations();
  const errorMessage = useAppErrorMessage();
  return (
    <>
      {draftFailed ? (
        <Alert
          tone="danger"
          title={t('draftSaveFailed')}
          action={
            <Button variant="secondary" onClick={onRetryDraft}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {schemaError ? (
        <Alert
          tone="danger"
          title={errorMessage(schemaError)}
          action={
            <Button variant="secondary" onClick={onRetrySchema}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
    </>
  );
}
