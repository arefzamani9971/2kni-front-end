'use client';
import { CatalogFormSession } from './CatalogFormSession';
import type { CategoryEditor, CreateCategoryFormProps } from './CreateCategoryForm.types';
import { CategoryFields } from './CategoryFields';

export function CreateCategoryForm(props: CreateCategoryFormProps) {
  return (
    <CatalogFormSession<CategoryEditor>
      id={'category:' + props.draftId}
      defaults={{ name: props.initialName, parentId: '' }}
    >
      {(session) => <CategoryFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
