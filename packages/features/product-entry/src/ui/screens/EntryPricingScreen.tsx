'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../common/components/EntryShell';
import { MissingDraft } from '../common/components/MissingDraft';
import { EntryDraftRecovery } from '../common/components/EntryDraftRecovery';
import { PricingForm } from '../components/PricingForm';
import { useEntryDraft } from '../common/hooks/use-entry-draft';
import { useEntryNav } from '../common/hooks/use-entry-nav';

/** pricing (Figma 312:9409, states pricingknown 312:10785 / pricingestimated 312:10851): F16. */
export function EntryPricingScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();

  const { draft, loading, error, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (error) return <PageState kind="error" />;
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title={t('salePrice')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  if (draft.pending || draft.result) return <EntryDraftRecovery draft={draft} />;
  return <PricingForm draft={draft} save={save} />;
}
