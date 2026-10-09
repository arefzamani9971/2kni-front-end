'use client';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { useActiveStore } from '@dukani/platform';
import { PageShell } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

/** Entry screens of page 17: title + «دکانی · فروشگاه», content, persistent actions, bottom navigation. */
export function EntryShell({
  title,
  actions,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const t = useEntryTranslations();
  const store = useActiveStore();
  return (
    <PageShell title={title} subtitle={t('storeSubtitle', { name: store.name })} actions={actions}>
      {children}
    </PageShell>
  );
}
