import type { ReactNode } from 'react';
import type { CatalogCategory } from '../../domain/catalog.types';

export type CreateCategoryFormProps = {
  draftId: string;
  initialName: string;
  categories: readonly CatalogCategory[];
  onCreated: (category: CatalogCategory) => void;
  onCancel: () => void;
  present: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
};

/** Raw category form values kept in the session draft. */
export type CategoryEditor = { name: string; parentId: string };
