'use client';
import { Button, PageState } from '@dukani/ui-kit';
import { useNewEntry } from '../hooks/use-new-entry';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { NewEntryHost } from '../types/use-new-entry.types';

export function EntryNewScreen(host: NewEntryHost) {
  const state = useNewEntry(host);
  const t = useEntryTranslations();
  if (!state.can) return <PageState kind="permission" />;
  return state.failed ? (
    <PageState kind="error" action={<Button onClick={state.retry}>{t('retry')}</Button>} />
  ) : (
    <PageState kind="loading" />
  );
}
