'use client';
import { CatalogFormSession } from './CatalogFormSession';
import type { CreateTypeFormProps, TypeEditor } from './CreateTypeForm.types';
import { TypeFields } from './TypeFields';

/** Product type creation (F05 categorynew), with its unfinished values kept in a session draft. */
export function CreateTypeForm(props: CreateTypeFormProps) {
  return (
    <CatalogFormSession<TypeEditor>
      id={'type:' + (props.draftId ?? 'new')}
      defaults={{
        fields: { name: props.initialName ?? '', categoryId: '', defaultBaseUnitId: '' },
        packages: [],
        creation: null,
      }}
    >
      {(session) => <TypeFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
