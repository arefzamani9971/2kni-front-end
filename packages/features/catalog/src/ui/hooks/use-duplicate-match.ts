'use client';
import { useState } from 'react';
import type { AppError } from '@dukani/domain';
import { normalizeTitle } from '@dukani/domain';
import type { CatalogPort } from '../../application/catalog-port.types';
import { useCatalogQuery } from './use-catalog-query';

/** What the server compared: the name and the level it must be unique in (category, parent group, or none). */
type Identity = { readonly name: string; readonly scope: string | null };

/**
 * After a server duplicate conflict, finds the existing visible record with the same normalized name in the same
 * scope, so the form can offer «use the existing one» next to «rename» (F05 §8, F06-S06). The identity is captured
 * when the error arrives (the submitted values) and the offer disappears as soon as the seller edits either part.
 * The server stays the authority; this is lookup only.
 */
export function useDuplicateMatch<T extends { readonly name: string }>(options: {
  readonly kind: string;
  readonly error: AppError | null;
  readonly code: string;
  readonly current: Identity;
  readonly load: (
    port: CatalogPort,
    storeId: string,
    name: string,
    signal: AbortSignal,
  ) => Promise<readonly T[]>;
  readonly scopeOf: (row: T) => string | null;
}): T | null {
  const { kind, error, code, current, load, scopeOf } = options;
  const [conflict, setConflict] = useState<{ error: AppError | null } & Identity>({
    error: null,
    name: '',
    scope: null,
  });
  // a new error snapshots the values that were submitted with it
  if (conflict.error !== error) setConflict({ error, ...current });
  const target = normalizeTitle(conflict.name);
  const unchanged = normalizeTitle(current.name) === target && current.scope === conflict.scope;
  const enabled = conflict.error?.code === code && !!target && unchanged;
  const rows = useCatalogQuery(
    ['duplicate', kind, target, conflict.scope ?? ''],
    (port, storeId, signal) => load(port, storeId, conflict.name.trim(), signal),
    enabled,
  );
  if (!enabled) return null;
  return (
    rows.data?.find((row) => normalizeTitle(row.name) === target && scopeOf(row) === conflict.scope) ?? null
  );
}
