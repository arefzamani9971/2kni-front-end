'use client';
import { Button } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Confirm (all-or-none commit) and back-to-edit; after a definitive failure «edit» releases the frozen rows. */
export function BulkReviewActions({
  busy,
  canConfirm,
  canEdit,
  onConfirm,
  onEdit,
}: {
  busy: boolean;
  canConfirm: boolean;
  canEdit: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <>
      <Button block loading={busy} disabled={!canConfirm} onClick={onConfirm}>
        {t('bulk.confirm')}
      </Button>
      <Button block variant="secondary" disabled={!canEdit} onClick={onEdit}>
        {t('bulk.edit')}
      </Button>
    </>
  );
}
