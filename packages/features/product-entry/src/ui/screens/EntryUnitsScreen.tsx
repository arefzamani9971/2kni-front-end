'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { EntryDraftRecovery } from '../components/EntryDraftRecovery';
import { UnitsForm } from '../components/UnitsForm';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** units (Figma 312:9135): base unit and purchase/sale packagings (F12). */
export function EntryUnitsScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();

  const { draft, loading, error, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (error) return <PageState kind="error" />;
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft?.newItem)
    return (
      <EntryShell title={t('unitsPacks')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  if (draft.pending || draft.result) return <EntryDraftRecovery draft={draft} />;
  return <UnitsForm key={draft.id} draftId={draft.id} item={draft.newItem} save={save} />;
}
