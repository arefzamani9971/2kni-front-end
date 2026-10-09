'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { Button, PageState } from '@dukani/ui-kit';
import { EntryShell } from './EntryShell';

/** A draft link opened on another device or after the draft was removed. */
export function MissingDraft({ onRestart }: { onRestart: () => void }) {
  const t = useEntryTranslations();

  return (
    <EntryShell title={t('draftMissing')}>
      <PageState
        kind="not-found"
        title={t('draftNotOnDevice')}
        description={t('draftDeviceHint')}
        action={<Button onClick={onRestart}>{t('restart')}</Button>}
      />
    </EntryShell>
  );
}
