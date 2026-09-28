'use client';
import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { CatalogDetails } from '../components/CatalogDetails';
import { NewItemDetails } from '../components/NewItemDetails';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** details step: catalog (Figma 312:8837) or manual new item (312:8870, duplicate 312:8957). */
export function EntryDetailsScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title="ثبت کالا">
        <PageState kind="loading" rows={4} />
      </EntryShell>
    );
  return draft.source === 'catalog' ? <CatalogDetails draft={draft} save={save} /> : <NewItemDetails draft={draft} save={save} />;
}
