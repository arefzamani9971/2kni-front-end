'use client';
import { Button, Alert, PageState } from '@dukani/ui-kit';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
export function EntryDraftRecovery({ draft }: { draft: EntryDraft }) {
  const go = useEntryNav();
  const t = useEntryTranslations();
  return (
    <EntryShell
      title={t('review')}
      actions={
        <Button onClick={() => go.step(draft.id, draft.result ? 'done' : 'review', true)}>
          {t('checkAgain')}
        </Button>
      }
    >
      {draft.result ? <Alert tone="info" title={t('productSaved')} /> : <PageState kind="unknown-result" />}
    </EntryShell>
  );
}
