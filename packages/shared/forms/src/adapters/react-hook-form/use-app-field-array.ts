'use client';
import { useFieldArray, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { AppFieldArray, AppForm, ArrayPath, FieldPathValue } from '../../types';

type ArrayItem<TIn, P extends string> = FieldPathValue<TIn, P> extends readonly (infer U)[] ? U : never;

export function useAppFieldArray<TIn, TOut, P extends ArrayPath<TIn>>(
  form: AppForm<TIn, TOut>,
  name: P,
): AppFieldArray<ArrayItem<TIn, P>> {
  const rhf = form.__internal as UseFormReturn<FieldValues>;
  const array = useFieldArray({ control: rhf.control, name: name as string, keyName: 'key' as 'id' });
  const result = {
    fields: array.fields,
    append: (item: unknown) => array.append(item as FieldValues),
    remove: array.remove,
    update: (index: number, item: unknown) => array.update(index, item as FieldValues),
    move: array.move,
  };
  return result as unknown as AppFieldArray<ArrayItem<TIn, P>>;
}
