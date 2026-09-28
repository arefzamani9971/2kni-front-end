'use client';
import type { ReactNode } from 'react';
import { useController, type Control, type FieldValues } from 'react-hook-form';
import type { BoundField } from '../../types';

/** Binds one form field to react-hook-form and hands the bound props to the render function. */
export function ControlledField({
  control,
  name,
  formId,
  children,
}: {
  control: Control<FieldValues>;
  name: string;
  formId: string;
  children: (field: BoundField<unknown>) => ReactNode;
}) {
  const { field, fieldState } = useController({ control, name });
  const message = fieldState.error?.message;
  return (
    <>
      {children({
        name: field.name,
        id: `${formId}-${name.replace(/\./g, '-')}`,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        ref: field.ref,
        status: message ? 'error' : undefined,
        message,
        invalid: !!message,
      })}
    </>
  );
}
