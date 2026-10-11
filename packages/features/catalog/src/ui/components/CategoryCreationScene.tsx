'use client';
import { FormScene } from '@dukani/ui-kit';
import type { CatalogCategory } from '../../domain/catalog.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CreateCategoryForm } from './CreateCategoryForm';

/** New group created from inside the type form, shown in a scene over it. */
export function CategoryCreationScene({
  draftId,
  initialName,
  categories,
  onCancel,
  onCreated,
}: {
  draftId: string;
  initialName: string;
  categories: readonly CatalogCategory[];
  onCancel: () => void;
  onCreated: (category: CatalogCategory) => void;
}) {
  const t = useCatalogTexts();
  return (
    <CreateCategoryForm
      draftId={draftId}
      initialName={initialName}
      categories={categories}
      onCancel={onCancel}
      onCreated={onCreated}
      present={(body, actions, onLeave) => (
        <FormScene
          open
          title={t('newCategory')}
          onOpenChange={(open) => {
            if (!open) onLeave();
          }}
          actions={actions}
        >
          {body}
        </FormScene>
      )}
    />
  );
}
