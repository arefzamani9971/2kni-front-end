'use client';
import { useCallback, useMemo, useState } from 'react';
import type { FilterDraft, FilterDraftOptions, FilterValues } from './filter-draft.types';
import { sameValue } from './same-value';

/**
 * Draft/applied filter state of PAT-FILTER-01. Typing changes only the draft (no request, no list loading); Apply
 * sends the whole filter at once and the list returns to page 1. The draft is the applied filter plus the user's
 * edits, so a filter changed elsewhere (chip ×, URL) shows up in untouched fields without syncing effects.
 */
export function useFilterDraft<F extends FilterValues>({
  applied,
  defaults,
  onApply,
}: FilterDraftOptions<F>): FilterDraft<F> {
  const [edits, setEdits] = useState<Partial<F>>({});
  const draft = useMemo(() => ({ ...applied, ...edits }) as F, [applied, edits]);
  const dirty = useMemo(
    () => Object.keys(edits).some((key) => !sameValue(edits[key], applied[key])),
    [edits, applied],
  );
  const activeKeys = useMemo(
    () => Object.keys(defaults).filter((key) => !sameValue(applied[key], defaults[key])) as (keyof F)[],
    [applied, defaults],
  );
  const set = useCallback((changes: Partial<F>) => setEdits((current) => ({ ...current, ...changes })), []);
  const apply = useCallback(() => {
    onApply(draft);
    setEdits({});
  }, [onApply, draft]);
  const reset = useCallback(() => setEdits({ ...defaults }), [defaults]);
  const remove = useCallback(
    (key: keyof F) => {
      onApply({ ...applied, [key]: defaults[key] });
      setEdits((current) => {
        const { [key]: _removed, ...rest } = current;
        return rest as Partial<F>;
      });
    },
    [onApply, applied, defaults],
  );
  const clearAll = useCallback(() => {
    onApply({ ...defaults });
    setEdits({});
  }, [onApply, defaults]);
  return useMemo(
    () => ({ draft, set, dirty, apply, reset, remove, clearAll, activeKeys }),
    [draft, set, dirty, apply, reset, remove, clearAll, activeKeys],
  );
}
