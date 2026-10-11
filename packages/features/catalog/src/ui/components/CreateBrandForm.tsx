'use client';
import { CatalogFormSession } from './CatalogFormSession';
import type { CreateBrandFormProps } from './CreateBrandForm.types';
import { BrandFields } from './BrandFields';

export function CreateBrandForm(props: CreateBrandFormProps) {
  return (
    <CatalogFormSession<{ name: string }>
      id={'brand:' + (props.draftId ?? 'new')}
      defaults={{ name: props.initialName ?? '' }}
    >
      {(session) => <BrandFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
