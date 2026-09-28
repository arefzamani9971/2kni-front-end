'use client';
// react-hook-form's watch()/formState are not compiler-memoizable; the adapter owns that trade-off.
/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from '@hookform/resolvers/zod';
import type { AppError } from '@dukani/domain';
import { useId, useMemo, type ReactElement, type ReactNode } from 'react';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import type { AppForm, BoundField, FieldPath } from '../../types';
import { ControlledField } from './ControlledField';

type AnySchema = z.ZodType<unknown, FieldValues>;

export type UseAppFormOptions<S extends AnySchema> = {
  readonly schema: S;
  readonly defaultValues: z.input<S>;
  /** Validate from the first change (default, ui-guidelines 2.4.1) or only on submit. */
  readonly validateOn?: 'change' | 'submit';
};

export function useAppForm<S extends AnySchema>(options: UseAppFormOptions<S>): AppForm<z.input<S>, z.output<S>> {
  type TIn = z.input<S>;
  type TOut = z.output<S>;
  const formId = useId();
  const rhf = useForm<FieldValues, unknown, FieldValues>({
    resolver: zodResolver(options.schema as never) as never,
    defaultValues: options.defaultValues as FieldValues,
    mode: options.validateOn === 'submit' ? 'onSubmit' : 'onChange',
    reValidateMode: 'onChange',
  }) as UseFormReturn<FieldValues, unknown, FieldValues>;

  const Field = useMemo(
    () =>
      function Field(props: { name: string; children: (field: BoundField<unknown>) => ReactNode }): ReactElement {
        return <ControlledField control={rhf.control} name={props.name} formId={formId} children={props.children} />;
      },
    [rhf.control, formId],
  );

  const { isSubmitting, isValid, isDirty, submitCount } = rhf.formState;

  return {
    Field: Field as unknown as AppForm<TIn, TOut>['Field'],
    handleSubmit: (onValid) => (event) => rhf.handleSubmit((values) => onValid(values as TOut))(event as never),
    applyServerError: (error: AppError) => {
      let matched = false;
      for (const [name, messages] of Object.entries(error.fieldErrors ?? {})) {
        if (name in (rhf.getValues() as object) || name.includes('.')) {
          rhf.setError(name, { type: 'server', message: messages[0] });
          matched = true;
        }
      }
      return matched;
    },
    setFieldError: (name: FieldPath<TIn>, message: string) => rhf.setError(name, { type: 'manual', message }),
    getValues: () => rhf.getValues() as TIn,
    watch: ((name: string) => rhf.watch(name)) as AppForm<TIn, TOut>['watch'],
    setValue: ((name: string, value: unknown) =>
      rhf.setValue(name, value, { shouldDirty: true, shouldValidate: rhf.formState.submitCount > 0 })) as AppForm<TIn, TOut>['setValue'],
    reset: (values?: TIn) => rhf.reset(values as FieldValues),
    focus: (name: FieldPath<TIn>) => rhf.setFocus(name),
    formState: { isSubmitting, isValid, isDirty, submitCount },
    __internal: rhf,
  };
}
