'use client';
import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { UnitsForm } from '../components/UnitsForm';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** units (Figma 312:9135): base unit and purchase/sale packagings (F12). */
export function EntryUnitsScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft?.newItem)
    return (
      <EntryShell title="واحد و بسته">
        <PageState kind="loading" />
      </EntryShell>
    );
  return <UnitsForm key={draft.id} draftId={draft.id} item={draft.newItem} save={save} />;
}
