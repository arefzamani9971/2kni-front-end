'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, PageShell, PageState } from '@dukani/ui-kit';

/** Destinations of later phases: a clear page state instead of a broken link (ReleaseGate). */
export function NotReleasedScreen({ title = 'به‌زودی' }: { title?: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  return (
    <PageShell title={title} subtitle={`دکانی · ${store.name}`}>
      <PageState
        kind="not-released"
        action={
          <Button variant="secondary" onClick={() => nav.replace(sellerRoutes.store.home(store.id))}>
            بازگشت به خانه
          </Button>
        }
      />
    </PageShell>
  );
}
