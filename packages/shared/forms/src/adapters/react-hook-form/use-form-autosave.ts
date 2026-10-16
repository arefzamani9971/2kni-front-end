'use client';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { AppForm } from '../../types';
import { FORM_AUTOSAVE_DELAY_MS } from './use-form-autosave.constants';
import type { FormAutosave, FormAutosaveOptions } from './use-form-autosave.types';

/**
 * Coalesced autosave of a form's raw input into a draft (PAT-FORM-01 «draft و خروج») without re-rendering anything.
 * The form is observed through a subscription: the first change of a burst is saved at once (a refresh right after
 * a single edit keeps it), the rest of the burst once after `delayMs` of quiet, and pending input is flushed on
 * unmount, when the page is hidden or left, and by `flush()`. A draft equal to the last save is not written again.
 * Unlike `form.watch`, typing re-renders only the field.
 *
 * ```tsx
 * const autosave = useFormAutosave(form, { select: (v) => ({ name: v.name }), save: draft.update, enabled: !locked });
 * useEffect(() => autosave.schedule(), [autosave, rowsOutsideTheForm]); // state the subscription cannot see
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

  /** Saves when the draft changed; true when something was written. */
  const commit = useCallback(() => {
    const { select, save, enabled = true } = latest.current;
    if (!enabled) return false;
    const draft = select(rhf.getValues() as TIn);
    const snapshot = JSON.stringify(draft);
    if (snapshot === saved.current) return false;
    saved.current = snapshot;
    save(draft);
    return true;
  }, [rhf]);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    commit();
  }, [commit]);

  const schedule = useCallback(() => {
    // leading edge: an idle form saves the first change at once and only then waits for the rest of the burst
    if (timer.current === null && !commit()) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, latest.current.delayMs ?? FORM_AUTOSAVE_DELAY_MS);
  }, [flush, commit]);

  useEffect(() => {
    // what the form starts with is already in the draft: nothing to save until the user edits
    saved.current = JSON.stringify(latest.current.select(rhf.getValues() as TIn));
    const unsubscribe = rhf.subscribe({ formState: { values: true }, callback: schedule });
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      unsubscribe();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHidden);
      flush();
    };
  }, [rhf, flush, schedule]);

  return { flush, schedule };
}
