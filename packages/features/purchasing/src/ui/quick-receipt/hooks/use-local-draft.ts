'use client';
import { useAppQuery, useQueryCache, type QueryKey } from '@dukani/data';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { LocalDraftSave } from '../types/use-local-draft.types';

/**
 * A flow's local draft (DraftStore through the module): read once, then every change goes through `save`, which
 * runs the updates one after another on the latest copy, writes them and keeps the query cache in step. A save
 * after unmount is dropped, so a closed screen never writes an old copy over a newer one.
 */
export function useLocalDraft<T>({
  queryKey,
  load,
  write,
  initial,
}: {
  readonly queryKey: QueryKey;
  readonly load: () => Promise<T | null>;
  readonly write: (draft: T) => Promise<void>;
  /** The draft a flow starts with when none is saved yet; null = the draft does not exist (e.g. an unknown queue). */
  readonly initial: () => T | null;
}) {
  const cache = useQueryCache();
  const q = useAppQuery({ queryKey, queryFn: async () => (await load()) ?? initial(), staleTime: Infinity });
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const latest = useRef({ load, write, initial, queryKey });
  useLayoutEffect(() => {
    latest.current = { load, write, initial, queryKey };
  });
  const save = useCallback<LocalDraftSave<T>>(
    (update) => {
      const task = chain.current.then(async () => {
        if (!active.current) return null;
        const { load: read, write: persist, initial: fresh, queryKey: key } = latest.current;
        const current = cache.get<T>(key) ?? (await read()) ?? fresh();
        if (current === null) return null;
        const next = update(current);
        await persist(next);
        if (active.current) cache.set(key, next);
        return next;
      });
      chain.current = task.catch(() => undefined);
      return task;
    },
    [cache],
  );
  return { draft: q.data ?? null, loading: q.isPending, error: q.error, save };
}
