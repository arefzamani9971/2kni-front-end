'use client';
import { useState } from 'react';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Button, PageShell, PageState } from '@dukani/ui-kit';
import { useProductsModule } from '../../module';
import { useProductTranslations } from '../i18n/use-product-translations';
import { ShortcutEditor } from '../components/ShortcutEditor';
export function ShortcutsScreen() {
  const store = useActiveStore();
  const { products, shortcutDrafts } = useProductsModule();
  const t = useProductTranslations();
  const query = useAppQuery({
    queryKey: ['product-shortcuts', store.id],
    queryFn: ({ signal }) => products.shortcuts(store.id, signal),
  });
  const draft = useAppQuery({
    queryKey: ['product-shortcuts-draft', store.id],
    queryFn: () => shortcutDrafts.read(store.id),
  });
  const [resetVersion, setResetVersion] = useState(0);
  if (query.isPending || draft.isPending)
    return (
      <PageShell title={t('shortcuts.title')}>
        <PageState kind="loading" />
      </PageShell>
    );
  if (query.error || draft.error)
    return (
      <PageShell title={t('shortcuts.title')}>
        <PageState
          kind="error"
          action={
            <Button
              onClick={() => {
                void query.refetch();
                void draft.refetch();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      </PageShell>
    );
  return (
    <ShortcutEditor
      key={store.id + ':' + resetVersion}
      initial={draft.data ?? query.data!}
      reload={async () => {
        const fresh = await products.shortcuts(store.id);
        await shortcutDrafts.write(store.id, {
          ...fresh,
          schemaVersion: 1,
          code: '',
          productId: '',
          query: '',
        });
        await draft.refetch();
        setResetVersion((v) => v + 1);
      }}
    />
  );
}
