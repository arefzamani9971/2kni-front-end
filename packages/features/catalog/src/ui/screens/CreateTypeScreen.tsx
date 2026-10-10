'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { CatalogShell } from '../components/CatalogShell';
import { CreateTypeForm } from '../components/CreateTypeForm';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function CreateTypeScreen() {
  const t = useCatalogTexts();
  const nav = useNavigation();
  const store = useActiveStore();
  return (
    <CreateTypeForm
      present={(content, actions, onLeave) => (
        <CatalogShell back={onLeave} title={t('newType')} actions={actions}>
          {content}
        </CatalogShell>
      )}
      onCreated={(type) => nav.replace(sellerRoutes.catalog.type(store.id, type.id))}
      onCancel={nav.back}
    />
  );
}
