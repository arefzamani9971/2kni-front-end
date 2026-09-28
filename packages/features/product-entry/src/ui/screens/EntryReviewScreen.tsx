'use client';
import { newOperationId } from '@dukani/domain';
import { PageState } from '@dukani/ui-kit';
import { useEffect } from 'react';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { Review } from '../components/Review';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** review (Figma 312:9441, reviewknown 312:10817, reviewestimated 312:10883): server preview → «تأیید و ثبت» (F13). */
export function EntryReviewScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  useEffect(() => {
    // one operation id per «تأیید و ثبت», persisted before sending so a refresh reuses it (P11)
    if (draft && !draft.operationId && !draft.result) void save((d) => ({ ...d, operationId: newOperationId() }));
  }, [draft, save]);
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft?.operationId)
    return (
      <EntryShell title="بازبینی کالا و موجودی">
        <PageState kind="loading" rows={3} />
      </EntryShell>
    );
  return <Review draft={draft} save={save} />;
}
