'use client';
import { PageState } from '@dukani/ui-kit';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { PricingForm } from '../components/PricingForm';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** pricing (Figma 312:9409, states pricingknown 312:10785 / pricingestimated 312:10851): F16. */
export function EntryPricingScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title="قیمت فروش">
        <PageState kind="loading" />
      </EntryShell>
    );
  return <PricingForm draft={draft} save={save} />;
}
