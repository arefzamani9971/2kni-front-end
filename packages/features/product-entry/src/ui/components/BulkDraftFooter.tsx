'use client';
import { Button } from '@dukani/ui-kit';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Last autosave time and row count of the bulk draft, with the discard action. */
export function BulkDraftFooter({
  updatedAt,
  rowCount,
  onDiscard,
}: {
  updatedAt: string;
  rowCount: number;
  onDiscard: () => void;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const time = new Date(updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="text-body-s text-fg-secondary flex flex-wrap items-center justify-between gap-2">
      <p>
        {t('bulk.saved', { time: presentation.digits(time) })} · {t('bulk.rowCount', { count: rowCount })}
      </p>
      <Button variant="secondary" size="sm" onClick={onDiscard}>
        {t('bulk.discard')}
      </Button>
    </div>
  );
}
