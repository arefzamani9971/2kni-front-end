import type { AttributeValue } from './entry-draft.types';

export type AttributeEditorValue = string | readonly string[];
export type AttributeEditorValues = Readonly<Record<string, AttributeEditorValue>>;
export type AttributeSchemaField = {
  readonly attributeId: string;
  readonly dataType: 'Text' | 'Number' | 'Bool' | 'Option' | 'MultiOption';
  readonly isRequired: boolean;
  readonly options: readonly { readonly id: string; readonly isArchived: boolean }[];
};
export type AttributeValidation = {
  readonly values: readonly AttributeValue[];
  readonly invalidIds: readonly string[];
};
