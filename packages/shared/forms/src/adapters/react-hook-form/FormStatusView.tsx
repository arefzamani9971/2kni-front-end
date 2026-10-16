'use client';
import type { ReactNode } from 'react';
import { useFormState, type Control, type FieldValues } from 'react-hook-form';
import type { AppFormState } from '../../types';

/**
 * Leaf subscriber of the submit state: only this element re-renders when `isSubmitting`/`isValid`/… change, and it
 * subscribes only to the keys the render function reads.
 */
export function FormStatusView({
  control,
  children,
}: {
  control: Control<FieldValues>;
  children: (state: AppFormState) => ReactNode;
}) {
  const state = useFormState({ control });
  return <>{children(state)}</>;
}
