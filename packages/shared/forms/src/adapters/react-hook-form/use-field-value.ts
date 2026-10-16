'use client';
import { useWatch, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { AppForm, FieldPath, FieldPathValue } from '../../types';

/**
 * Live value of one field in the component that depends on it (a dependent select, a preview line). Unlike
 * `form.watch`, typing re-renders this component only, not the whole form.
 */
export function useFieldValue<TIn, TOut, P extends FieldPath<TIn>>(
  form: AppForm<TIn, TOut>,
  name: P,
): FieldPathValue<TIn, P> {
  const rhf = form.__internal as UseFormReturn<FieldValues>;
  return useWatch({ control: rhf.control, name: name as string }) as FieldPathValue<TIn, P>;
}
