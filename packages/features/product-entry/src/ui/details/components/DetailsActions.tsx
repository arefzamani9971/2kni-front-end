'use client';
import { Button } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { DetailsActionsProps } from '../types/DetailsActions.types';

export function DetailsActions({ review, busy, disabled, onBack }: DetailsActionsProps) {
  const t = useEntryTranslations();
  return (
    <>
      <Button type="submit" block loading={busy} disabled={disabled}>
        {t(review ? 'reviewContinue' : 'productAttributes')}
      </Button>
      {onBack ? (
        <Button type="button" block variant="secondary" disabled={busy} onClick={onBack}>
          {t('back')}
        </Button>
      ) : null}
    </>
  );
}
