'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { CatalogDetails } from '../components/CatalogDetails';
import { NewItemDetails } from '../components/NewItemDetails';
import { useEntryDraft } from '../hooks/use-entry-draft';
import type { CatalogCreationSlots } from '../components/CatalogCreationSlots.types';
import { useEntryNav } from '../hooks/use-entry-nav';

/** details step: catalog (Figma 312:8837) or manual new item (312:8870, duplicate 312:8957). */
export function EntryDetailsScreen({
  draftId,
  creators,
}: {
  draftId: string;
  creators?: CatalogCreationSlots;
}) {
  const t = useEntryTranslations();

  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title={t('recordProduct')}>
        <PageState kind="loading" rows={4} />
      </EntryShell>
    );
  return draft.source === 'catalog' ? (
    <CatalogDetails draft={draft} save={save} />
  ) : (
    <NewItemDetails draft={draft} save={save} creators={creators} />
  );
}
