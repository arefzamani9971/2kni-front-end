'use client';
// react-hook-form's watch()/formState are not compiler-memoizable; the adapter owns that trade-off.
/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from '@hookform/resolvers/zod';
import type { AppError } from '@dukani/domain';
import { useEffect, useId, useMemo, useRef, type ReactElement, type ReactNode } from 'react';
import { useForm, type FieldValues, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import type { AppForm, AppFormState, BoundField, FieldPath } from '../../types';
import { ControlledField } from './ControlledField';
import { FieldValueView } from './FieldValueView';
import { FormStatusView } from './FormStatusView';
import { schemaErrorPaths } from './schema-error-paths';
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
  const { control } = rhf;

  const Field = useMemo(
    () =>
      function Field(props: { name: string; children: (field: BoundField<unknown>) => ReactNode }): ReactElement {
        return <ControlledField control={control} name={props.name} formId={formId} children={props.children} />;
      },
    [control, formId],
  );
  const Status = useMemo(
    () =>
      function Status(props: { children: (state: AppFormState) => ReactNode }): ReactElement {
        return <FormStatusView control={control} children={props.children} />;
      },
    [control],
  );
  const Value = useMemo(
    () =>
      function Value(props: { name: string; children: (value: unknown) => ReactNode }): ReactElement {
        return <FieldValueView control={control} name={props.name} children={props.children} />;
      },
    [control],
  );

  const previousValidationKey = useRef(options.validationKey);
  useEffect(() => {
    if (previousValidationKey.current === options.validationKey) return;
    previousValidationKey.current = options.validationKey;
    // Re-translate only the errors the schema produced; manual and server errors keep their text.
    const paths = schemaErrorPaths(rhf);
    if (paths.length) void rhf.trigger(paths);
  }, [options.validationKey, rhf]);

  const methods = useMemo(
    () => ({
      handleSubmit: ((onValid) => (event) =>
        rhf.handleSubmit((values) => onValid(values as TOut))(event as never)) as AppForm<TIn, TOut>['handleSubmit'],
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
    }),
    [rhf],
  );

  // Submit state and dirtiness are subscribed by the host: they flip rarely (one re-render per flip) and are read
  // in event handlers (`setValue`, leave guards), where only a subscribed snapshot is current. Validity is lazy:
  // subscribing to it runs a second whole-schema validation on every change, so only forms that read
  // `formState.isValid` during render pay for it — prefer `form.Status` / `useFormStatus` in a leaf component.
  const { isSubmitting, submitCount, isDirty } = rhf.formState;
  const formState: AppFormState = {
    isSubmitting,
    submitCount,
    isDirty,
    get isValid() {
      return rhf.formState.isValid;
    },
  };

  return {
    ...methods,
    Field: Field as unknown as AppForm<TIn, TOut>['Field'],
    Status,
    Value: Value as unknown as AppForm<TIn, TOut>['Value'],
    formState,
    __internal: rhf,
  };
}
