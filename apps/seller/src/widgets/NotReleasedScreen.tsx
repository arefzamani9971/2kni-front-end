'use client';
import { useAppTranslations } from '../i18n/use-app-translations';

import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, PageShell, PageState } from '@dukani/ui-kit';

/** Destinations of later phases: a clear page state instead of a broken link (ReleaseGate). */
export function NotReleasedScreen({ title }: { title?: string }) {
  const t = useAppTranslations();
  title ??= t('comingSoon');

  const store = useActiveStore();
  const nav = useNavigation();
  return (
    <PageShell title={title} subtitle={t('storeSubtitle', { name: store.name })}>
      <PageState
        kind="not-released"
        action={
          <Button variant="secondary" onClick={() => nav.replace(sellerRoutes.store.home(store.id))}>
            {t('backHome')}
          </Button>
        }
      />
    </PageShell>
  );
}
