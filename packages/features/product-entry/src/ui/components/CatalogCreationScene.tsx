'use client';
import type { ReactNode } from 'react';
import { FormScene } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { CatalogCreationSlots } from './CatalogCreationSlots.types';
import type { DetailsCreation } from './NewItemDetails.types';

/** Hosts the catalog feature's brand/type creation form in a scene; the host draft stays untouched on cancel. */
export function CatalogCreationScene({
  creation,
  creators,
  draftId,
  onCancel,
  onBrandCreated,
  onTypeCreated,
}: {
  creation: DetailsCreation;
  creators: CatalogCreationSlots | undefined;
  draftId: string;
  onCancel: () => void;
  onBrandCreated: (brand: { id: string; name: string }) => void;
  onTypeCreated: (type: { id: string; name: string }) => void;
}) {
  const t = useEntryTranslations();
  const present = (title: string) => (content: ReactNode, actions: ReactNode, onLeave: () => void) => (
    <FormScene
      open
      onOpenChange={(open) => {
        if (!open) onLeave();
      }}
      title={title}
      actions={actions}
    >
      {content}
    </FormScene>
  );
  const common = { draftId, initialName: creation.name, onCancel };
  return creation.kind === 'brand'
    ? (creators?.brand?.({ ...common, present: present(t('createBrand')), onCreated: onBrandCreated }) ??
        null)
    : (creators?.type?.({ ...common, present: present(t('createType')), onCreated: onTypeCreated }) ?? null);
}
