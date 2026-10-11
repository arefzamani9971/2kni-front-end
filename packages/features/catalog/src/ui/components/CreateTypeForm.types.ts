import type { ReactNode } from 'react';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { typeSchema } from './TypeFields.schema';
export type CreateTypeFormProps = {
  readonly present?: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
  readonly draftId?: string;
  readonly initialName?: string;
  readonly onCreated: (type: { id: string; name: string }) => void;
  readonly onCancel: () => void;
};

/** One editable default package row; `key` is local identity only. */
export type PackageRow = { key?: string; name: string; baseQty: string };

/** Raw type form values kept in the session draft. */
export type TypeEditor = {
  fields: { name: string; categoryId: string; defaultBaseUnitId: string };
  packages: PackageRow[];
  creation: { name: string } | null;
};

/** The product type form shared by its field sections. */
export type TypeForm = AppForm<InferInput<TypeSchema>, Infer<TypeSchema>>;
type TypeSchema = ReturnType<typeof typeSchema>;
