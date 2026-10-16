'use client';
import { useFormState, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { AppForm, AppFormState } from '../../types';

/**
 * Submit state for a component below the form (e.g. its action bar). Read only what you need: each key read
 * subscribes this component — and only it — to that key.
 */
export function useFormStatus<TIn, TOut>(form: AppForm<TIn, TOut>): AppFormState {
  const rhf = form.__internal as UseFormReturn<FieldValues>;
  return useFormState({ control: rhf.control });
}
