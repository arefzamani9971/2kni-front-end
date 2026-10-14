'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { newOperationId } from '@dukani/domain';
import { PageState } from '@dukani/ui-kit';
import { useEffect } from 'react';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { Review } from '../components/Review';
import { EntryDraftRecovery } from '../components/EntryDraftRecovery';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** review (Figma 312:9441, reviewknown 312:10817, reviewestimated 312:10883): server preview → «تأیید و ثبت» (F13). */
export function EntryReviewScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();

  const { draft, loading, error, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  useEffect(() => {
    // one operation id per «تأیید و ثبت», persisted before sending so a refresh reuses it (P11)
    if (draft && !draft.operationId && !draft.result)
      void save((d) => ({ ...d, operationId: newOperationId() }));
  }, [draft, save]);
  if (error) return <PageState kind="error" />;
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft?.operationId)
    return (
      <EntryShell title={t('review')}>
        <PageState kind="loading" rows={3} />
      </EntryShell>
    );
  if (draft.result) return <EntryDraftRecovery draft={draft} />;
  return <Review draft={draft} save={save} />;
}
