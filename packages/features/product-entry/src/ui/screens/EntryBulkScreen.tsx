'use client';
import { Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { emptyBulkDraft } from '../../domain/bulk-draft';
import { BulkEditor } from '../components/BulkEditor';
import { EntryShell } from '../components/EntryShell';
import { useBulkDraft } from '../hooks/use-bulk-draft';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Loads the store's bulk draft (recoverable read error, loading) and hands it to the editor. */
export function EntryBulkScreen({ stage = 'edit' }: { stage?: 'edit' | 'review' | 'done' }) {
  const q = useBulkDraft();
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  if (q.error)
    return (
      <EntryShell title={t('bulk.title')}>
        <PageState
          kind="error"
          description={message(q.error)}
          action={<Button onClick={() => void q.refetch()}>{t('retry')}</Button>}
        />
      </EntryShell>
    );
  if (q.isPending)
    return (
      <EntryShell title={t('bulk.title')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  return <BulkEditor draft={q.data ?? emptyBulkDraft()} update={q.update} stage={stage} />;
}
