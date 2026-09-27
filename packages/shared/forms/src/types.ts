import type { AppError } from '@dukani/domain';
import type { ReactElement, ReactNode } from 'react';
import type { ArrayPath, FieldPath, FieldPathValue } from './field-path';

/** Props a form hands to any ui-kit field: `<form.Field name="mobile">{(f) => <IranMobileField {...f} />}</form.Field>`. */
export type BoundField<V = string> = {
  readonly name: string;
  readonly id: string;
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly onBlur: () => void;
  /** Callback ref (assignable to any element ref, e.g. `Ref<HTMLInputElement>`). */
  readonly ref: (instance: HTMLElement | null) => void;
  readonly status?: 'error';
  readonly message?: string;
  readonly invalid: boolean;
};

export type AppFormState = {
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly submitCount: number;
};

export type AppForm<TIn, TOut> = {
  /** Render-prop binder for one field. */
  readonly Field: <P extends FieldPath<TIn>>(props: {
    name: P;
    children: (field: BoundField<FieldPathValue<TIn, P>>) => ReactNode;
  }) => ReactElement;
  /** Wraps a submit handler: validates, parses (schema output) and calls `onValid`. */
  readonly handleSubmit: (onValid: (values: TOut) => void | Promise<void>) => (event?: { preventDefault(): void }) => Promise<void>;
  /** Puts server field errors (400 VALIDATION_FAILED) next to fields; returns true if any matched. */
  readonly applyServerError: (error: AppError) => boolean;
  readonly setFieldError: (name: FieldPath<TIn>, message: string) => void;
  readonly getValues: () => TIn;
  readonly watch: <P extends FieldPath<TIn>>(name: P) => FieldPathValue<TIn, P>;
  readonly setValue: <P extends FieldPath<TIn>>(name: P, value: FieldPathValue<TIn, P>) => void;
  readonly reset: (values?: TIn) => void;
  readonly focus: (name: FieldPath<TIn>) => void;
  readonly formState: AppFormState;
  /** Opaque handle for `useAppFieldArray`. */
  readonly __internal: unknown;
};

export type AppFieldArray<TItem> = {
  readonly fields: readonly (TItem & { readonly key: string })[];
  readonly append: (item: TItem) => void;
  readonly remove: (index: number) => void;
  readonly update: (index: number, item: TItem) => void;
  readonly move: (from: number, to: number) => void;
};

export type { ArrayPath, FieldPath, FieldPathValue };
