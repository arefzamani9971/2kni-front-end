'use client';
import type { ReactNode } from 'react';
import { useWatch, type Control, type FieldValues } from 'react-hook-form';

/** Leaf subscriber of one field's live value; replaces `form.watch(name)`, which re-renders the whole form. */
export function FieldValueView({
  control,
  name,
  children,
}: {
  control: Control<FieldValues>;
  name: string;
  children: (value: unknown) => ReactNode;
}) {
  const value = useWatch({ control, name });
  return <>{children(value)}</>;
}
