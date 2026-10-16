'use client';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { AppForm } from '../../types';
import { FORM_AUTOSAVE_DELAY_MS } from './use-form-autosave.constants';
import type { FormAutosave, FormAutosaveOptions } from './use-form-autosave.types';

/**
 * Coalesced autosave of a form's raw input into a draft (PAT-FORM-01 «draft و خروج») without re-rendering anything:
 * the form is observed through a subscription, `save` runs after `delayMs` of quiet, and pending input is flushed
 * on unmount (sub-step, back, navigation) and by `flush()`. Unlike `form.watch`, typing re-renders only the field.
 *
 * ```tsx
 * useFormAutosave(form, { select: (v) => ({ name: v.name }), save: draft.update, enabled: !locked });
 * ```
 */
export function useFormAutosave<TIn, TOut, TDraft>(
  form: AppForm<TIn, TOut>,
  options: FormAutosaveOptions<TIn, TDraft>,
): FormAutosave {
  const rhf = form.__internal as UseFormReturn<FieldValues>;
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saved = useRef<string | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const { select, save, enabled = true } = latest.current;
    if (!enabled) return;
    const draft = select(rhf.getValues() as TIn);
    const snapshot = JSON.stringify(draft);
    if (snapshot === saved.current) return;
    saved.current = snapshot;
    save(draft);
  }, [rhf]);

  useEffect(() => {
    // what the form starts with is already in the draft: nothing to save until the user edits
    saved.current = JSON.stringify(latest.current.select(rhf.getValues() as TIn));
    const unsubscribe = rhf.subscribe({
      formState: { values: true },
      callback: () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(flush, latest.current.delayMs ?? FORM_AUTOSAVE_DELAY_MS);
      },
    });
    return () => {
      unsubscribe();
      flush();
    };
  }, [rhf, flush]);

  return { flush };
}
