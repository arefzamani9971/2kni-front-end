'use client';
import { useEffect } from 'react';
import type { FormSession } from './CatalogFormSession.types';

/** Persists the form snapshot whenever it changes (skipped once the command has succeeded). */
export function CatalogAutosave<T>({
  value,
  session,
  disabled,
}: {
  value: T;
  session: FormSession<T>;
  disabled?: boolean;
}) {
  const snapshot = JSON.stringify(value);
  const persist = session.persist;
  useEffect(() => {
    if (!disabled) void persist(JSON.parse(snapshot) as T);
  }, [snapshot, persist, disabled]);
  return null;
}
