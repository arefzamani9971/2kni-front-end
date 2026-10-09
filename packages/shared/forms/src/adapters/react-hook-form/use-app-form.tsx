'use client';
// react-hook-form's watch()/formState are not compiler-memoizable; the adapter owns that trade-off.
/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from '@hookform/resolvers/zod';
import type { AppError } from '@dukani/domain';
import { useEffect, useId, useMemo, useRef, type ReactElement, type ReactNode } from 'react';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import type { AppForm, BoundField, FieldPath } from '../../types';
import { ControlledField } from './ControlledField';
import type { AnySchema, UseAppFormOptions } from './use-app-form.types';

export function useAppForm<S extends AnySchema>(
  options: UseAppFormOptions<S>,
): AppForm<z.input<S>, z.output<S>> {
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
      function Field(props: {
        name: string;
        children: (field: BoundField<unknown>) => ReactNode;
      }): ReactElement {
        return (
          <ControlledField
            control={rhf.control}
            name={props.name}
            formId={formId}
            children={props.children}
          />
        );
      },
    [rhf.control, formId],
  );

  const { isSubmitting, isValid, isDirty, submitCount } = rhf.formState;
  const previousValidationKey = useRef(options.validationKey);
  useEffect(() => {
    if (previousValidationKey.current === options.validationKey) return;
    previousValidationKey.current = options.validationKey;
    const paths: string[] = [];
    const visit = (errors: object, prefix = '') => {
      for (const [name, error] of Object.entries(errors)) {
        if (!error || typeof error !== 'object') continue;
        const path = prefix ? `${prefix}.${name}` : name;
        if ('type' in error && typeof error.type === 'string') {
          if (error.type !== 'manual' && error.type !== 'server') paths.push(path);
        } else visit(error, path);
      }
    };
    visit(rhf.formState.errors);
    if (paths.length) void rhf.trigger(paths);
  }, [options.validationKey, rhf]);

  return {
    Field: Field as unknown as AppForm<TIn, TOut>['Field'],
    handleSubmit: (onValid) => (event) =>
      rhf.handleSubmit((values) => onValid(values as TOut))(event as never),
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
      rhf.setValue(name, value, {
        shouldDirty: true,
        shouldValidate: rhf.formState.submitCount > 0,
      })) as AppForm<TIn, TOut>['setValue'],
    reset: (values?: TIn) => rhf.reset(values as FieldValues),
    focus: (name: FieldPath<TIn>) => rhf.setFocus(name),
    formState: { isSubmitting, isValid, isDirty, submitCount },
    __internal: rhf,
  };
}
